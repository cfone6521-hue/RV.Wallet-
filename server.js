import express from 'express';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3888;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RV Web3 API está online',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/balances', async (req, res) => {
  try {
    const { address, chainId } = req.query;
    if (!address) {
      return res.status(400).json({ success: false, error: 'Endereço é obrigatório' });
    }
    res.json({
      success: true,
      data: { data: [{ tokenAssets: [] }] }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro' });
  }
});

app.get('/api/transactions', async (req, res) => {
  res.json({ success: true, data: { data: [{ transactionList: [] }] } });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
