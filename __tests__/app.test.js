const pool = require(`${__dirname}/../db/connection`);
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

const app = require(`${__dirname}/../app`);

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return pool.end();
});

describe("GET /api/categories", () => {
  test("returns an array from a get request at this endpoint", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((res) => {
        expect(res.body).toBeInstanceOf(Array);
      });
  });
  test("Elements of array are objects", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((res) => {
        res.body.forEach((element) => {
          expect(element).toBeInstanceOf(Object);
        });
      });
  });
  test("Elements of array are objects with the correct properties and types", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((res) => {
        res.body.forEach((element) => {
          expect(element).toHaveProperty("slug", expect.any(String));

          expect(element).toHaveProperty("description", expect.any(String));
        });
      });
  });
});

describe("GET /api/users", () => {
  test("Elements of array are objects with the correct properties and types", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((res) => {
        res.body.users.forEach((element) => {
          expect(element).toHaveProperty("username", expect.any(String));

          expect(element).toHaveProperty("name", expect.any(String));

          expect(element).toHaveProperty("avatar_url", expect.any(String));
        });
      });
  });
  test("Returned array has all of the users (is length 4)", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((res) => {
        expect(res.body.users.length).toBe(4);
      });
  });

  describe("GET /api/reviews/:review_id", () => {
    test("returns an array with length 1", () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then((res) => {
          expect(res.body.reviews).toBeInstanceOf(Array);
          expect(res.body.reviews.length).toBe(1);
        });
    });

    test("Has the correct properties and types", () => {
      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then((res) => {
          let returnedObj = res.body.reviews[0];
          expect(returnedObj).toHaveProperty("review_id", expect.any(Number));

          expect(returnedObj).toHaveProperty("title", expect.any(String));

          expect(returnedObj).toHaveProperty("designer", expect.any(String));

          expect(returnedObj).toHaveProperty(
            "review_img_url",
            expect.any(String)
          );

          expect(returnedObj).toHaveProperty("votes", expect.any(Number));

          expect(returnedObj).toHaveProperty("category", expect.any(String));

          expect(returnedObj).toHaveProperty("owner", expect.any(String));

          expect(returnedObj).toHaveProperty("created_at", expect.any(String));
        });
    });

    test("returns the correct review from the ID", () => {
      let checker = {
        review_id: 1,
        title: "Agricola",
        designer: "Uwe Rosenberg",
        owner: "mallionaire",
        review_img_url:
          "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        review_body: "Farmyard fun!",
        category: "euro game",
        created_at: new Date(1610964020514),
        votes: 1,
      };

      return request(app)
        .get("/api/reviews/1")
        .expect(200)
        .then((res) => {
          for (key in checker) {
            if (key !== "created_at") {
              expect(checker[key]).toBe(res.body.reviews[0][key]);
            } else {
              expect(checker[key]).toEqual(new Date(res.body.reviews[0][key]));
            }
          }
          expect(res.body.reviews[0].comment_count).toBe(1);
        });
    });

    test("returns a 400 error if a review ID is requested that doesn't exist (non integer review ID)", () => {
      return request(app).get("/api/reviews/blahhhash").expect(400);
    });

    test("returns a 404 error if a review ID is requested that doesn't exist (numerical ID requested, but doesn't exist in the data)", () => {
      return request(app).get("/api/reviews/109800").expect(404);
    });
  });

  //////////////First task ^

  test("the returned object includes a comment_count key", () => {
    return request(app)
      .get("/api/reviews/3")
      .expect(200)
      .then((res) => {
        expect(res.body.reviews[0]).toHaveProperty("comment_count");
      });
  });
  test("returned object's comment count is a number", () => {
    return request(app)
      .get("/api/reviews/3")
      .expect(200)
      .then((res) => {
        expect(res.body.reviews[0]).toHaveProperty(
          "comment_count",
          expect.any(Number)
        );
      });
  });
  test("Also works when the comment count is 0 (like user 1)", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then((res) => {
        expect(res.body.reviews[0]).toHaveProperty(
          "comment_count",
          expect.any(Number)
        );
      });
  });
});

describe("Patch /api/reviews/:review_id", () => {
  test("returns an object", () => {
    return request(app)
      .patch("/api/reviews/1")
      .send({ inc_votes: 20 })
      .expect(201)
      .then((res) => {
        expect(res.body).toBeInstanceOf(Object);
      });
  });
  test("returns an array with length 1", () => {
    //The starting votes at review ID 1 is 1, so if 34 are added it should be 35 at the end
    return request(app)
      .patch("/api/reviews/1")
      .send({ inc_votes: 34 })
      .expect(201)
      .then((res) => {
        expect(res.body.votes).toBe(35);
      });
  });
  test("returns a 404 error if a review ID is used that doesn't exist", () => {
    return request(app)
      .patch("/api/reviews/1021340123109")
      .send({ inc_votes: 1 })
      .expect(404);
  });

  test("returns a 404 error if a review ID is used that is invalid", () => {
    return request(app)
      .patch("/api/reviews/asda")
      .send({ inc_votes: 1 })
      .expect(400);
  });

  test("returns an error if the vote ID is invalid", () => {
    return request(app)
      .patch("/api/reviews/asda")
      .send({ inc_votes: "a" })
      .expect(400);
  });

  test("returns an error if the vote number is negative", () => {
    return request(app)
      .patch("/api/reviews/asda")
      .send({ inc_votes: -1 })
      .expect(400);
  });

  test("returns a 404 error if the vote number is missing", () => {
    return request(app).patch("/api/reviews/1").expect(400);
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("returns an array of objects and a 200 status", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((res) => {
        res.body.comments.forEach((comment) => {
          expect(comment).toBeInstanceOf(Object);
        });
      });

  test("Returned objects are fully correct", () => {
    let correct = [
      {
        comment_id: 1,
        body: "I loved this game too!",
        review_id: 2,
        author: "bainesface",
        votes: 16,
        created_at: "2017-11-22T12:43:33.389Z",
      },
      {
        comment_id: 4,
        body: "EPIC board game!",
        review_id: 2,
        author: "bainesface",
        votes: 16,
        created_at: "2017-11-22T12:36:03.389Z",
      },
      {
        comment_id: 5,
        body: "Now this is a story all about how, board games turned my life upside down",
        review_id: 2,
        author: "mallionaire",
        votes: 13,
        created_at: "2021-01-18T10:24:05.410Z",
      },
    ];
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((res) => {
        expect(res.body.comments).toEqual(correct);
      });
  });
});

describe("get /api/reviews?category=<categoryName>&sort_by=<sort_category>&order=<ASC/DESC>", () => {
  test("returns an array of objects", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((res) => {
        expect(res.body.reviewList).toBeInstanceOf(Array);
        res.body.reviewList.forEach((element) => {
          expect(element).toBeInstanceOf(Object);
        });
      });
  });
  test("returns an array of objects with the correct properties", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((res) => {
        let objArr = res.body.reviewList;
        for (element of objArr) {
          expect(element).toHaveProperty("review_id", expect.any(Number));
          expect(element).toHaveProperty("owner", expect.any(String));
          expect(element).toHaveProperty("title", expect.any(String));
          expect(element).toHaveProperty("category", expect.any(String));
          expect(element).toHaveProperty("review_img_url", expect.any(String));
          expect(element).toHaveProperty("created_at", expect.any(String));
          expect(element).toHaveProperty("votes", expect.any(Number));
          expect(element).toHaveProperty("designer", expect.any(String));
          expect(element).toHaveProperty("comment_count", expect.any(Number));
        }
      });
  });
  test("Objects are sorted in descending date order by default", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((res) => {
        expect(res.body.reviewList).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("filters list on a given category, correct number of objects returned and all fit the filter criterion", () => {
    return request(app)
      .get("/api/reviews?owner=mallionaire")
      .expect(200)
      .then((list) => {
        expect(list.body.reviewList.length).toBe(11);
        list.body.reviewList.forEach((element) => {
          expect(element.owner).toBe("mallionaire");
        });
      });
  });
  test("filters list on multiple given categories, correct number of objects returned and all fit the filter criterion", () => {
    return request(app)
      .get("/api/reviews?owner=mallionaire&title=Agricola")
      .expect(200)
      .then((list) => {
        expect(list.body.reviewList.length).toBe(1);
        list.body.reviewList.forEach((element) => {
          expect(element.owner).toBe("mallionaire");
          expect(element.title).toBe("Agricola");
        });
      });
  });

  test("returns an empty array with a 200 status even when it is an empty array answer", () => {
    return request(app)
      .get("/api/reviews?owner=malli")
      .expect(200)
      .then((res) => {
        expect(res.body.reviewList).toEqual([]);
      });
  });
  test("returns a 404 error if the requested category is invalid", () => {
    return request(app)
      .get("/api/reviews?ownedBy=malli")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("not a valid key");
      });
  });
  test("rejects with an error when the same key is used more than once", () => {
    return request(app)
      .get("/api/reviews?owner=mallionaire&owner=bainesface")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Query has been entered more than once");
      });
  });

  test("returns 200 when given a sort_by constraint and returns an array of objects", () => {
    return request(app).get("/api/reviews?sort_by=owner").expect(200);
  });

  test("returns 200 when given a sort_by constraint and returns an array of objects in the correct order", () => {
    return request(app)
      .get("/api/reviews?sort_by=owner")
      .expect(200)
      .then((reviews) => {
        const reviewArr = reviews.body.reviewList;
        expect(reviewArr).toBeSortedBy("owner", { descending: true });
      });
  });

  test("returns 200 when given a sort_by constraint and an order method and returns an array of objects in the correct order", () => {
    return request(app)
      .get("/api/reviews?sort_by=created_at&order=asc")
      .expect(200)
      .then((reviews) => {
        const reviewArr = reviews.body.reviewList;
        expect(reviewArr).toBeSortedBy("created_at", { ascending: true });
      });
  });

  test("returns 200 and a filtered list when given a sort_by constraint and returns an array of objects in the correct order", () => {
    return request(app)
      .get("/api/reviews?owner=mallionaire&sort_by=created_at&order=asc")
      .expect(200)
      .then((reviews) => {
        const reviewArr = reviews.body.reviewList;
        expect(reviewArr).toBeSortedBy("created_at", { ascending: true });
        reviewArr.forEach((review) => {
          expect(review.owner).toBe("mallionaire");
        });
      });
  });

  test("returns 404 when order query is not asc/desc (and is not a string", () => {
    return request(app)
      .get("/api/reviews?owner=mallionaire&sort_by=created_at&order=1")
      .expect(404);
  });

  test("returns 404 when sort_by query is not a valid key (and is not a string)", () => {
    return request(app)
      .get("/api/reviews?owner=mallionaire&sort_by=1&order=asc")
      .expect(404);
  });

  test("rejects with an error when the same option is used twice", () => {
    return request(app)
      .get("/api/reviews?sort_by=mallionaire&sort_by=bainesface")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Query has been entered more than once");
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  test("returns a 201 status", () => {
    const inputObj = {
      username: "mallionaire",
      body: "This was decent, not the best not the worst",
    };

    return request(app)
      .post("/api/reviews/10/comments")
      .send(inputObj)
      .expect(201);
  });
  test("returns a 201 status, with an attached object (with correct keys", () => {
    const inputObj = {
      username: "mallionaire",
      body: "This was decent, not the best not the worst",
    };

    return request(app)
      .post("/api/reviews/10/comments")
      .send(inputObj)
      .expect(201)
      .then((res) => {
        let returnedObj = res.body.comment;

        expect(returnedObj).toHaveProperty("comment_id", expect.any(Number));
        expect(returnedObj).toHaveProperty("body", expect.any(String));
        expect(returnedObj).toHaveProperty("review_id", expect.any(Number));
        expect(returnedObj).toHaveProperty("author", expect.any(String));
        expect(returnedObj).toHaveProperty("votes", expect.any(Number));
        expect(returnedObj).toHaveProperty("created_at", expect.any(String));
      });
  });

  test("Returns a 201 status, and the uploaded object has the correct specific values where possible to check (Will also have a review_id, commend_id, votes, and created_at)", () => {
    const inputObj = {
      username: "mallionaire",
      body: "This was decent, not the best not the worst",
    };

    return request(app)
      .post("/api/reviews/10/comments")
      .send(inputObj)
      .expect(201)
      .then((res) => {
        let returnedObj = res.body.comment;
        expect(returnedObj.author).toBe(inputObj.username);
        expect(returnedObj.body).toBe(inputObj.body);
        expect(returnedObj.votes).toBe(0);
      });
  });

  test("Returns a 400 status, when the review id (in endpoint) is the wrong format", () => {
    const inputObj = {
      username: "mallionaire",
      body: "This was decent, not the best not the worst",
    };

    return request(app)
      .post("/api/reviews/a/comments")
      .send(inputObj)
      .expect(400);
  });


  test("Returns a 404 status, when given an non-existent key on the attached object", () => {

    const inputObj = {
      name: "mallionaire",
      body: "This was decent, not the best not the worst",
    };

    return request(app)
      .post("/api/reviews/1/comments")
      .send(inputObj)
      .expect(404);
  });

  test("Returns a 404 status, if given a username that is not in the foreign key", () => {
    const inputObj = {
      username: "josh",
      body: "This was decent, not the best not the worst",
    };

    return request(app)
      .post("/api/reviews/1/comments")
      .send(inputObj)
      .expect(404);
  });

  test("Returns a 404 status, if not given a username (this is the foreign key)", () => {
    const inputObj = {
      body: "This was decent, not the best not the worst",
    };

    return request(app)
      .post("/api/reviews/1/comments")
      .send(inputObj)
      .expect(404);
  });


  test("Returns a 404 status, if not given a body in the sent object (this is not the foreign key)", () => {
    const inputObj = {
      username: "mallionaire",
    };

    return request(app)
      .post("/api/reviews/1/comments")
      .send(inputObj)
      .expect(404);
  });

  test("Returns a 404 status, if not given an object to attach", () => {
    return request(app).post("/api/reviews/1/comments").expect(404);
  });
});

describe("api delete comment by ID", () => {
  test("returns 204 status and empty body", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({});
      });
  });
  test("returns 404 status when the requested comment ID doesn't exist", () => {
    return request(app).delete("/api/comments/10120102").expect(404);
  });
  test("returns 400 status when the requested comment ID is the wrong type (not a string)", () => {
    return request(app).delete("/api/comments/asa").expect(400);
  });
  test("Returns a 400 status, if not given an object to attach", () => {
    return request(app).post("/api/reviews/1/comments").expect(404);
  });
});
