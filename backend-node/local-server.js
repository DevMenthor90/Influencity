require('dotenv').config();
const app = require('./lib/app');

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`InfluencerAPI (Node) escuchando en http://localhost:${port}`);
});
