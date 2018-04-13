import { shallow } from "enzyme";
import React from "react";
import UserPage from "./UserPage";
import { NavLink } from "react-router-dom";

describe("userPage structure Testing", () => {
  it("should find all structure element", () => {
    const wrapper = shallow(<UserPage />);
    expect(wrapper.find("div")).toHaveLength(3);
    expect(wrapper.find("li")).toHaveLength(4);
    expect(wrapper.find(NavLink)).toHaveLength(4);
  });
});