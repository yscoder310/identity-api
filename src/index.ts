import express from 'express';
import identifyRoutes from './routes/identity.routes';

const app = express();
const PORT =  3000;

app.use(express.json());
app.use('/identify', identifyRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});