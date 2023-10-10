const { format } = require('date-fns');
const banco = require('../dados/bancodedados');

let idProximaContaCriada = 1;


const obterContas = (req, res) => {
    return res.json(banco.contas);
}

const adicionarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome deve ser informado' });
    }

    if (!cpf) {
        return res.status(400).json({ mensagem: 'O cpf deve ser informado' });
    }

    if (!data_nascimento) {
        return res.status(400).json({ mensagem: 'A data de nascimento deve ser informada' });
    }

    if (!telefone) {
        return res.status(400).json({ mensagem: 'O telefone deve ser informado' });
    }

    if (!email) {
        return res.status(400).json({ mensagem: 'O email deve ser informado' });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha deve ser informada' });
    }

    if (cpf.length < 11) {
        return res.status(400).json({ mensagem: 'Insira um cpf válido' });
    }

    const cpfExistente = banco.contas.find(conta => conta.usuario.cpf === cpf);
    const emailExistente = banco.contas.find(conta => conta.usuario.email === email);

    if (cpfExistente || emailExistente) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" });
    }

    const novaConta = {
        numero: idProximaContaCriada,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    banco.contas.push(novaConta);

    idProximaContaCriada++

    return res.status(201).send();

}

const atualizarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome deve ser informado' });
    }

    if (!cpf) {
        return res.status(400).json({ mensagem: 'O cpf deve ser informado' });
    }

    if (!data_nascimento) {
        return res.status(400).json({ mensagem: 'A data de nascimento deve ser informada' });
    }

    if (!telefone) {
        return res.status(400).json({ mensagem: 'O telefone deve ser informado' });
    }

    if (!email) {
        return res.status(400).json({ mensagem: 'O email deve ser informado' });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha deve ser informada' });
    }

    if (cpf.length < 11) {
        return res.status(400).json({ mensagem: 'Insira um cpf válido' });
    }

    const cpfExistente = banco.contas.find(conta => conta.usuario.cpf === cpf);
    const emailExistente = banco.contas.find(conta => conta.usuario.email === email);

    if (cpfExistente || emailExistente) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" });
    }

    const contaExistente = banco.contas.find(contas => contas.numero === Number(req.params.numero));

    if (!contaExistente) {
        return res.status(404).json({ mensagem: "Não existe conta com o número informado." });
    }

    contaExistente.usuario.nome = nome;
    contaExistente.usuario.cpf = cpf;
    contaExistente.usuario.data_nascimento = data_nascimento;
    contaExistente.usuario.telefone = telefone;
    contaExistente.usuario.email = email;
    contaExistente.usuario.senha = senha;

    return res.status(201).send();

}

const deletarConta = (req, res) => {
    const indiceContaExistente = banco.contas.findIndex(conta => conta.numero === Number(req.params.numero));

    if (indiceContaExistente < 0) {
        return res.status(404).json({ mensagem: 'A conta a ser removida não existe' });
    }

    if (banco.contas[indiceContaExistente].saldo !== 0) {
        return res.status(404).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" });
    }

    banco.contas.splice(indiceContaExistente, 1);

    return res.status(201).send();

}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body;

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: 'O número da conta e o valor são obrigatórios!' });
    }

    const contaExistente = banco.contas.find(contas => contas.numero === Number(req.body.numero_conta));
    const indiceContaExistente = banco.contas.findIndex(conta => conta.numero === Number(req.body.numero_conta));

    if (!contaExistente) {
        return res.status(404).json({ mensagem: "Não existe conta com o número informado." });
    }

    let depositar = banco.contas[indiceContaExistente].saldo += valor;

    if (depositar <= 0) {
        return res.status(404).json({ mensagem: "Insira um valor válido." });
    } else {
        depositar = banco.contas[indiceContaExistente].saldo;
    }

    const deposito = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta,
        valor
    }

    banco.depositos.push(deposito);

    return res.status(201).send();

}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    const contaExistente = banco.contas.find(contas => contas.numero === Number(numero_conta));

    if (!contaExistente) {
        return res.status(404).json({ mensagem: "Não existe conta com o número informado." });
    }

    const indiceContaExistente = banco.contas.findIndex(conta => conta.numero === Number(numero_conta));

    if (banco.contas[indiceContaExistente].usuario.senha !== senha) {
        return res.status(404).json({ mensagem: "Senha invalida" });
    }

    if (banco.contas[indiceContaExistente].saldo < valor) {
        return res.status(404).json({ mensagem: "Você não possui saldo suficiente para a transação" });
    }

    let valorSacado = banco.contas[indiceContaExistente].saldo - valor;
    banco.contas[indiceContaExistente].saldo = valorSacado;

    const sacar = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta,
        valor: banco.contas[indiceContaExistente].saldo
    }

    banco.saques.push(sacar);

    return res.status(201).send();
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: 'Detalhes insuficientes' });
    }

    const contaExistenteOrigem = banco.contas.find(contas => contas.numero === Number(req.body.numero_conta_origem));
    const contaExistenteDestino = banco.contas.find(contas => contas.numero === Number(req.body.numero_conta_destino));
    const indiceContaExistenteOrigem = banco.contas.findIndex(conta => conta.numero === Number(req.body.numero_conta_origem));
    const indiceContaExistenteDestino = banco.contas.findIndex(conta => conta.numero === Number(req.body.numero_conta_destino));

    if (!contaExistenteOrigem || !contaExistenteDestino) {
        return res.status(404).json({ mensagem: "Não existe conta com o número informado." });
    }

    if (banco.contas[indiceContaExistenteOrigem].usuario.senha !== senha) {
        return res.status(404).json({ mensagem: "Senha invalida" });
    }

    if (banco.contas[indiceContaExistenteOrigem].saldo < valor) {
        return res.status(404).json({ mensagem: "Você não possui saldo suficiente para a transação" });
    }

    let valorAposTransferenciaOrigem = banco.contas[indiceContaExistenteOrigem].saldo - valor;
    let valorAposTransferenciaDestino = banco.contas[indiceContaExistenteDestino].saldo + valor;

    banco.contas[indiceContaExistenteOrigem].saldo = valorAposTransferenciaOrigem;
    banco.contas[indiceContaExistenteDestino].saldo = valorAposTransferenciaDestino;

    const transferencia = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta_origem,
        numero_conta_destino,
        valor
    }

    banco.transferencias.push(transferencia);

    return res.status(201).send();

}

const saldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'O número da conta e a senha são obrigatórios!' });
    }

    const contaExistente = banco.contas.find(conta => conta.numero === Number(req.query.numero_conta));

    if (!contaExistente) {
        return res.status(404).json({ mensagem: "Conta bancária não encontrada!" });
    }

    const indiceContaExistente = banco.contas.findIndex(conta => conta.numero === Number(req.query.numero_conta));

    if (banco.contas[indiceContaExistente].usuario.senha !== senha) {
        return res.status(404).json({ mensagem: "Senha invalida" });
    }

    const saldoFinal = {
        saldo: banco.contas[indiceContaExistente].saldo
    }

    return res.status(201).send(saldoFinal);

}

const extrato = (req, res) => {
    const numeroConta = req.query.numero_conta;
    const senha = req.query.senha;

    const contaExistente = banco.contas.find((conta) => conta.numero == numeroConta);

    if (!contaExistente) {
        return res.status(404).json({ mensagem: "Conta bancária não encontrada" });
    } else if (senha !== contaExistente.usuario.senha) {
        return res.status(401).json({ mensagem: "Senha incorreta" });
    }

    const depositosNaConta = banco.depositos.filter(
        (deposito) => deposito.numero_conta === numeroConta
    );
    const saquesNaConta = banco.saques.filter(
        (saque) => saque.numero_conta === numeroConta
    );

    let transferenciasEnviadas = [];
    let transferenciasRecebidas = [];

    for (const transferencia of banco.transferencias) {
        if (transferencia.numero_conta_origem === numeroConta) {
            transferenciasEnviadas.push(transferencia);
        }
        if (transferencia.numero_conta_destino === numeroConta) {
            transferenciasRecebidas.push(transferencia);
        }
    }

    const extrato = {
        depositos: depositosNaConta,
        saques: saquesNaConta,
        transferenciasEnviadas,
        transferenciasRecebidas,
    };

    return res.status(200).json(extrato);
};


module.exports = {
    obterContas,
    adicionarConta,
    atualizarConta,
    deletarConta,
    depositar,
    transferir,
    saldo,
    extrato,
    sacar
}