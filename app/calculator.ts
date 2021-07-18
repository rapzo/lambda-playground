export const handler = async () => ({
  statusCode: 200,
  body: JSON.stringify({
    "answer": "41",
    "name": process.env.NAME,
  }),
})
