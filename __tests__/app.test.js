const pool = require(`${__dirname}/../db/connection`);
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const { reduce } = require("../db/data/test-data/categories");
const { expect } = require("@jest/globals");
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
  test("returns an error if a review ID is used that doesn't exist", () => {
    return request(app)
      .patch("/api/reviews/1021340123109")
      .send({ inc_votes: 1 })
      .expect(400);
  });

  test("returns an error if a review ID is used that is invalid", () => {
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

  test("returns an error if the vote number is missing", () => {
    return request(app).patch("/api/reviews/1").expect(400);
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("returns an array of objects and a 200 status", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((res)=>{
        expect(res.body.data).toBeInstanceOf(Array)
        res.body.data.forEach((element)=>{
          expect(element).toBeInstanceOf(Object)
        })
      })
  });
  test("Returns an array of the correct length", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((res)=>{
        expect(res.body.data.length).toBe(3)
      })
  });
  test("Returns an array where each element has the correct keys and value types", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((res)=>{
        res.body.data.forEach((element)=>{
          expect(element).toHaveProperty("comment_id", expect.any(Number))
          expect(element).toHaveProperty("votes", expect.any(Number))
          expect(element).toHaveProperty("created_at", expect.any(String))
          expect(element).toHaveProperty("body", expect.any(String))
          expect(element).toHaveProperty("review_id", expect.any(Number))
        })
      })
  });
  test("Returned objects are fully correct", () => {
    let correct = [{
      comment_id: 1,
      body: 'I loved this game too!',
      review_id: 2,
      author: 'bainesface',
      votes: 16,
      created_at: '2017-11-22T12:43:33.389Z'
    },
    {
      comment_id: 4,
      body: 'EPIC board game!',
      review_id: 2,
      author: 'bainesface',
      votes: 16,
      created_at: '2017-11-22T12:36:03.389Z'
    },
    {
      comment_id: 5,
      body: 'Now this is a story all about how, board games turned my life upside down',
      review_id: 2,
      author: 'mallionaire',
      votes: 13,
      created_at: '2021-01-18T10:24:05.410Z'
    }];
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((res)=>{
        let count=0;
        res.body.data.forEach((element)=>{
          expect(element).toEqual(correct[count])
        count++
        })
      })
  });
});
