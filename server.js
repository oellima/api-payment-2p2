const express = require('express');
const cors = require('cors');
// ESTA É A LINHA QUE CORRIGE O REFERENCERROR:
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// Faz o Express servir os arquivos da pasta atual (onde está o index.html)
app.use(express.static(__dirname));

// Garante que qualquer rota caia no seu index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
  res.send("Servidor Rodando com Sucesso!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

// 1. ADICIONE SEU ACCESS TOKEN AQUI (Obtenha no Painel do Desenvolvedor do Mercado Pago)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

app.post('/create_preference', async (req, res) => {
    try {
        // 1. Verificação básica dos dados vindos do front
        const { description, amount, email } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "O preço (amount) é obrigatório" });
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        title: description || "Pagamento Genérico",
                        quantity: 1,
                        unit_price: Number(amount), // Garante que é número
                        currency_id: 'BRL'
                    }
                ],
                // Só envia o payer se o email estiver presente
                ...(email && { payer: { email: email } }),
                back_urls: {
                    success: "https://seusite.com/sucesso",
                    failure: "https://seusite.com/erro",
                    pending: "https://seusite.com/pendente"
                },
                auto_return: "approved",
            }
        });

        // 2. Envia o ID de volta para o front-end
        res.json({ id: result.id });

    } catch (error) {
        // 3. Isso vai mostrar o motivo real do erro nos Logs do Render
        console.error("ERRO DETALHADO DO MERCADO PAGO:", error);
        
        res.status(500).json({ 
            error: "Erro ao processar", 
            details: error.message 
        });
    }
});

// O Render define a porta automaticamente na variável process.env.PORT
//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));