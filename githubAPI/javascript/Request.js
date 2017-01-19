"use strict";
(() => {

  const genericHtml = (response) => {
    const oldResponseData = document.querySelector(".response-data");
    const responseData = document.createElement("div");
    responseData.className = "response-data";
    const responseText = document.createTextNode(response);
    responseData.append(responseText);
    oldResponseData.replaceWith(responseData);
  };

  const showResult = (result) => {
    result
      .then(res => {
        genericHtml(res);
      })
      .catch((rej) => {
        genericHtml(rej);
      });
  };

  const xhrApi = (input) => {

    const request = (method, url, data) => {

      if (!data)
        data = null;

      if(!method)
        return Promise.reject("Please enter an http method");

      if(url === "")
        url = undefined;

      return new Promise((res, rej) => {
        const xhrObject = new XMLHttpRequest();
        xhrObject.open(method, url, true);
        xhrObject.onload = () => {
          if (xhrObject.status >= 200 && xhrObject.status < 300)
            res(xhrObject.response);

          else if (xhrObject.status >= 400)
            rej(xhrObject.status + " NOT FOUND");

          else
            res(xhrObject.status + xhrObject.response);
        };

        xhrObject.send(data);
        xhrObject.onerror = (e) => {
          console.log(e);
          rej("Failed during fetching data from Api (View console for details..)");
        };
      });
    };

    const queryStringified = (url, queryObject) => {
      const queries = queryObject || "";
      let queryString = "?";
      Object.keys(queries).forEach(query => (queryString += (encodeURIComponent(query) + "=" + encodeURIComponent(queryObject[query]) + "&")));
      queryString = queryString.slice(0, queryString.length - 1);
      return url.concat(queryString);
    };

    if(input.split("*")[0] === "query")
      showResult(request("GET", queryStringified(input.split("*")[1], JSON.parse(input.split("*")[2]))));

    else
      showResult(request(input.split("*")[0].toUpperCase(), input.split("*")[1], input.split("*")[2]));

  };

  const callXhr = () => {
    xhrApi(document.getElementById("input").value);
  };

  (() => {
    document.getElementById("input").addEventListener("keyup", function (event) {
      event.preventDefault();
      if(event.keyCode === 13)
        callXhr();
    });
    document.getElementById("button").addEventListener("click", callXhr);
  })();

})();
