const URL = Cypress.env("baseUrl");
const { User } = require("../seedData/fakeData");

describe("Home", function() {
  before(function() {
    cy.visit(URL);
  });
  it("should redirect to login page ", () => {
    cy
      .get("[data-cy=login]")
      .click()
      .url()
      .should("eq", URL + "login");
  });
});

describe("happy and unhappy paths", function() {
  before(function() {
    cy.visit(URL + "signup");
    cy
      .get("input#name")
      .type(User.name)
      .get("input#email")
      .type(User.email)
      .get("input#password")
      .type(User.password)
      .get("button[type=submit]")
      .click();
  });
  beforeEach(function() {
    cy.visit(URL + "login");
  });

  it("should show alert error message when both fields are not filled", function() {
    cy.get("button[type=submit]").click();
    cy.get("[data-cy=error]").should("be.visible");
  });

  it("should successfully log user in when both fields are filled", function() {
    cy
      .get("input#email")
      .type(User.email)
      .get("input#password")
      .type(User.password);
    cy
      .get("button[type=submit]")
      .click()
      .url()
      .should("eq", URL + "mydashboard");
  });

  it("should return an error message if invalid id or password is supplied", () => {
    cy
      .get("input#email")
      .type("absd@email.com")
      .get("input#password")
      .type("password")
      .get("button[type=submit]")
      .click()
      .get("[data-cy=error]")
      .should("be.visible")
      .contains("Your email or password is invalid");
  });
});

describe("forget password path", function() {
  it("should successfully direct to forgot password when clicked upon at log in page", function() {
    cy.visit(URL + "login");
    cy
      .get("a[data-cy=forgot-password]")
      .click({ force: true })
      .url()
      .should("eq", URL + "forgot");
  });
});

describe("Reset", () => {
  beforeEach(function() {
    cy.visit(URL + "forgot");
  }),
    it("should return success message that email reset is sent", () => {
      cy
        .get("input#email")
        .type(User.email)
        .get("button[type=submit]")
        .click()
        .get("[data-cy=success]")
        .should("be.visible")
        .contains(
          "An email has been sent to " +
            User.email +
            " with further instructions."
        );
    });
});
