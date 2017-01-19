"use strict";

const Request = require("./Request");
const sinon = require("sinon");

let open, send, temp, server, jsonObject;

function xhrMockClass() {
  return {open, send};
}

describe("Cases of the API over ", () => {
  describe("XMLHttpRequest behaviours: the API should ", () => {

    beforeAll(() => {
      open = jest.fn();
      send = jest.fn();
      temp = window.XMLHttpRequest;
      window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);
    });

    afterAll(() => {
      window.XMLHttpRequest = temp;
    });

    it("create an XMLHttpRequest for 'put' request even with one parameter", () => {
      Request.put("whatever");
      expect(send).toHaveBeenCalled();
    });

    it("create an XMLHttpRequest for 'delete' request even with no parameter", () => {
      Request.delete();
      expect(send).toHaveBeenCalled();
    });

    it("create an XMLHttpRequest for 'options' request with two parameters", () => {
      Request.options("whereever", "abc");
      expect(send).toHaveBeenCalled();
    });

    it("create an XMLHttpRequest for any request even if they're undefined http verbs with one parameter", () => {
      Request.whatever("whereever");
      expect(send).toHaveBeenCalled();
    });

    it("create an XMLHttpRequest for any request even with extra parameters", () => {
      Request.which("whereever", {}, {}, "");
      expect(send).toHaveBeenCalled();
    });

    it("call an XMLHttpRequest with 'get' method and with given 'url' ", () => {
      Request.get("abc");
      expect(open).toHaveBeenCalledWith("GET", "abc", true);
    });

    it("call an XMLHttpRequest with 'post' method and with no parameter ", () => {
      Request.post();
      expect(open).toHaveBeenCalledWith("POST", "", true);
    });

    it("call an XMLHttpRequest with a method which is undefined with given url ", () => {
      Request.smth("any");
      expect(open).toHaveBeenCalledWith("SMTH", "any", true);
    });

    it("not call an XMLHttpRequest to a wrong url with any method(either defined or undefined)", () => {
      Request.post("abc");
      expect(open).not.toHaveBeenCalledWith("POST", "klm", true);
    });

    it("not call an XMLHttpRequest with a incompatible request type with any method(either defined or undefined)", () => {
      Request.get("abc");
      expect(open).not.toHaveBeenCalledWith("HEAD", "klm", true);
    });

  });

  describe("a fake server, when it responses", () => {

    beforeAll(() => {
      jsonObject = {"aracArray": [{"YEAR": 2009, "CATEGORY": "coupe", "PRICE": 820000, "LPG": false}]};
      server = sinon.fakeServer.create();
    });

    afterAll(() => {
      server.restore();
    });

    describe("successful: the API should return a", () => {

      it("'resolved' promise whose value is an object which shows truly matched url,method,status and data of the 'GET' operation if data is a json object", () => {
        server.respondWith("GET", "abc", [200, {"Content-Type": "text/javascript"}, '{ "id": 12, "comment": "Hey there" }']);
        const testResult = Request.get("abc", jsonObject).then(data => expect(data).toEqual({
          RequestURL: "abc",
          RequestMethod: "GET",
          StatusCode: 200,
          RequestPayload: jsonObject
        }));
        server.respond();
        return testResult;
      });

      it("'resolved' promise whose value is an object which shows url, method and status of the 'POST' operation if method is called with one parameter", () => {
        server.respondWith("POST", "abc", [200, {"Content-Type": "text/javascript"}, '{ "id": 12, "comment": "Hey there" }']);
        const testResult = Request.post("abc").then(data => expect(data).toEqual({
          RequestURL: "abc",
          RequestMethod: "POST",
          StatusCode: 200
        }));
        server.respond();
        return testResult;
      });

      it("'resolved' promise whose value is an object which shows truly matched url, method,status and data of the 'HEAD' operation if data is a string ", () => {
        server.respondWith("HEAD", "abc", [200, {"Content-Type": "text/javascript"}, '{ "id": 12, "comment": "Hey there" }']);
        const testResult = Request.head("abc", "blabla").then(data => expect(data).toEqual({
          RequestURL: "abc",
          RequestMethod: "HEAD",
          StatusCode: 200,
          RequestPayload: "blabla"
        }));
        server.respond();
        return testResult;
      });

      it("'rejected' promise whose value is '404 Not Found' if the user requested with no parameters with connect method ", () => {
        server.respondWith("CONNECT", "abc", [200, {"Content-Type": "text/javascript"}, '{ "id": 12, "comment": "Hey there" }']);
        const testResult = Request.connect().catch(data => expect(data).toEqual("404 Not Found"));
        server.respond();
        return testResult;
      });

      it("'rejected' promise whose value is '404 Not Found' if the user requested with an undefined http method with extra parameters ", () => {
        server.respondWith("PUT", "abc", [200, {"Content-Type": "text/javascript"}, '{ "id": 12, "comment": "Hey there" }']);
        const testResult = Request.blabla("abc", 5, {}).catch(data => expect(data).toEqual("404 Not Found"));
        server.respond();
        return testResult;
      });

    });

    describe("not successful: the API should return a", () => {

      it("'rejected' promise whose value is '404 not found' if server response with 'client error' ", () => {
        server.respondWith("TRACE", "abc", [404, {"Content-Type": "text/javascript"}, '{ "id": 12, "comment": "Hey there" }']);
        const testResult = Request.trace("abc", jsonObject).catch(data => expect(data).toEqual("404 Not Found"));
        server.respond();
        return testResult;
      });

      it("'rejected' promise whose value is '404 not found' if server response with 'server error' ", () => {
        server.respondWith("TRACE", "abc", [502, {"Content-Type": "text/javascript"}, '{ "id": 12, "comment": "Hey there" }']);
        const testResult = Request.trace("abc", jsonObject).catch(data => expect(data).toEqual("404 Not Found"));
        server.respond();
        return testResult;
      });

      it("'rejected' promise whose value is 'Process Failed 301' if server response with 'moved permamently' ", () => {
        server.respondWith("TRACE", "abc", [301, {"Content-Type": "text/javascript"}, '{ "id": 12, "comment": "Hey there" }']);
        const testResult = Request.trace("abc", jsonObject).catch(data => expect(data).toEqual("Process Failed 301"));
        server.respond();
        return testResult;
      });

      it("'rejected' promise whose value is 'Process Failed 102' if server response with 'moved permamently' ", () => {
        server.respondWith("TRACE", "abc", [102, {"Content-Type": "text/javascript"}, '{ "id": 12, "comment": "Hey there" }']);
        const testResult = Request.trace("abc", jsonObject).catch(data => expect(data).toEqual("Process Failed 102"));
        server.respond();
        return testResult;
      });

    });

  });
});
