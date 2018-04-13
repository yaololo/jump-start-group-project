process.env.NODE_ENV = "test";

const testDB = require("../test_helper/in_memory_mongodb_setup");
const fixtureLoader = require("../test_helper/fixtures");
const fixtures = require("../test_helper/fixtures").fixtures;
const Feedback = require("../models/Feedback");
const random = require("../utils/crypto_promise");

const request = require("supertest");
const app = require("../app");

beforeAll(testDB.setup);
beforeAll(fixtureLoader.load);

afterAll(testDB.teardown);

let jwtToken;

async function loginAsTom() {
  let email = fixtures.users.tom.email;
  let password = fixtures.users.tom.password;
  let response = await request(app)
    .post("/api/users/login")
    .send({ user: { email, password } });
  jwtToken = response.body.token;
}

describe("Accessing Feedback API without login", () => {
  it("should return a 401 unauthorized code", async () => {
    let response = await request(app).post("/api/feedback/initiate");
    expect(response.statusCode).toBe(401);
  });
});

describe("Accessing Feedback API with login", () => {
  beforeAll(loginAsTom);
  let valid_receiver = "jacky@example.com";
  let invalid_receiver = "receiver@receiver.com";
  let feedbackItems = [
    "Good points",
    "You can do a lot better",
    "Lots of room for improvement"
  ];

  it("should return success for happy path", async () => {
    let feedback_initiate = {
      receiver: valid_receiver,
      feedbackItems: feedbackItems
    };
    let response = await request(app)
      .post("/api/feedback/initiate")
      .set("Authorization", "Bearer " + jwtToken)
      .send(feedback_initiate);
    expect(response.statusCode).toBe(200);
  });

  it("should return 400 bad request for receiver email not found in the system", async () => {
    let feedback_initiate = {
      receiver: invalid_receiver,
      feedbackItems: feedbackItems
    };
    let response = await request(app)
      .post("/api/feedback/initiate")
      .set("Authorization", "Bearer " + jwtToken)
      .send(feedback_initiate);
    expect(response.statusCode).toBe(400);
  });

  it("should return 400 bad request for empty receiver email", async () => {
    let feedback_initiate = {
      receiver: "",
      feedbackItems: feedbackItems
    };
    let response = await request(app)
      .post("/api/feedback/initiate")
      .set("Authorization", "Bearer " + jwtToken)
      .send(feedback_initiate);
    expect(response.statusCode).toBe(400);
  });

  it("should create an entry in the db", async () => {
    const giver_email = fixtures.users.tom.email;
    const feedback_item = await random(256);
    let feedbackItems = [feedback_item, feedback_item, feedback_item];
    let feedback_initiate = {
      receiver: valid_receiver,
      feedbackItems: feedbackItems
    };
    await Feedback.remove({ receiver: valid_receiver });

    await request(app)
      .post("/api/feedback/initiate")
      .set("Authorization", "Bearer " + jwtToken)
      .send(feedback_initiate);

    let feedback = await Feedback.findOne({
      receiver: valid_receiver,
      giver: giver_email
    });

    expect(feedback.receiver).toEqual(valid_receiver);
    expect(feedback.giver).toEqual(giver_email);
    expect(feedback.status).toEqual("RECEIVER_UNREAD");
    expect(Array.from(feedback.feedbackItems)).toEqual(feedbackItems);
  });
});