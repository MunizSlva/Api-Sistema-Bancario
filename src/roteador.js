const express = require('express');
const validaSenha = require('./intermediarios');
const { obterContas, adicionarConta, atualizarConta, deletarConta, depositar, transferir, saldo, extrato, sacar } = require('./controladores/banco');
const rotas = express();

rotas.get('/contas', validaSenha, obterContas);
rotas.post('/contas', adicionarConta);
rotas.put('/contas/:numero/usuario', atualizarConta);
rotas.delete('/contas/:numero', deletarConta);
rotas.post('/transacoes/depositar', depositar);
rotas.post('/transacoes/transferir', transferir);
rotas.get('/contas/saldo', saldo);
rotas.get('/contas/extrato', extrato);
rotas.post('/transacoes/sacar', sacar);

module.exports = rotas;