const express = require('express');
const path = require('path');
const app = express();

// Faz o Express servir os arquivos da pasta atual (onde está o index.html)
app.use(express.static(__dirname));

// Garante que qualquer rota caia no seu index.html
app.get('/:any(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

// 1. ADICIONE SEU ACCESS TOKEN AQUI (Obtenha no Painel do Desenvolvedor do Mercado Pago)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

app.post('/create_preference', async (req, res) => {
    try {
        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        title: req.body.description || "Pagamento Genérico",
                        quantity: 1,
                        unit_price: Number(req.body.amount),
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    email: req.body.email
                },
                back_urls: {
                    success: "https://seusite.com/sucesso",
                    failure: "https://seusite.com/erro",
                    pending: "https://seusite.com/pendente"
                },
                auto_return: "approved",
            }
        });

        // Retorna o link de checkout para o front-end
        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao criar preferência");
    }
});

// O Render define a porta automaticamente na variável process.env.PORT
//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));