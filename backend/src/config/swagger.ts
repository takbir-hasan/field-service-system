import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Field Service Management API",
      version: "1.0.0",
      description:
        "REST API for field service ticket management",
    },

    servers: [
      {
        url: "http://localhost:5050/api",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

apis: [
  process.env.NODE_ENV === "production"
    ? "./dist/docs/*.js"
    : "./src/docs/*.ts",
],
};

export const swaggerSpec =
  swaggerJsdoc(options);