const pool = require(`${__dirname}/../db/connection`);
const request = require("supertest");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const { reduce } = require("../db/data/test-data/categories");
const app = require(`${__dirname}/../app`);

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return pool.end();
});

/*
-returns an array
-elements are objects
-elements are objects with correct properties
*/

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

describe("GET /api/reviews/:review_id", () => {
  test("returns an array with length 1", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then((res) => {
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
      });
  });

  test("Has the correct properties and types", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then((res) => {
        let returnedObj = res.body[0];
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
            expect(checker[key]).toBe(res.body[0][key]);
          } else {
            expect(checker[key]).toEqual(new Date(res.body[0][key]));
          }
        }
      });
  });

  test("returns a 400 error if a review ID is requested that doesn't exist (non integer review ID)", () => {
    return request(app).get("/api/reviews/blahhhash").expect(400);
  });

  test("returns a 404 error if a review ID is requested that doesn't exist (numerical ID requested, but doesn't exist in the data)", () => {
    return request(app).get("/api/reviews/109800").expect(404);
  });
});
