const Receita = require("../models/receita.model");
const ValidacaoDuplicado = require("./Validacao");
const Requisicao = require("./Requisicao");

exports.receita_lista = async function (req, res) {
  const busca = req.query.descricao;
  const pagina = req.query.page;

  if (busca == undefined && pagina == undefined) {
    try {
      const receitas = await Receita.find({}, "descricao valor data ");
      res.json(receitas);
    } catch (err) {
      res.status(500).json("Erro: " + err);
    }
  } else if (busca !== undefined && pagina == undefined) {
    try {
      const receita = await Receita.find(
        { descricao: busca },
        "descricao valor data "
      );
      res.json(receita);
    } catch (err) {
      res.status(400).json("Erro: " + err);
    }
  } else {
    try {
      const receita = await Receita.find({}, "descricao valor data ", {
        skip: (pagina - 1) * 5,
        limit: 5,
      });
      res.json(receita);
    } catch (err) {
      res.status(400).json("Erro: " + err);
    }
  }
};

exports.receita_lista_pagina = async function (req, res) {
  const pagina = req.query.page;

  try {
    const receita = await Receita.find({}, "descricao valor data ", {
      skip: (pagina - 1) * 5,
      limit: 5,
    });
    res.json(receita);
  } catch (err) {
    res.status(400).json("Erro: " + err);
  }
};

exports.receita_anoMes = async function (req, res) {
  const ano = req.params.ano;
  const mes = req.params.mes;

  try {
    const receitas = await Receita.find(
      { data: { $gte: `${ano}-${mes}-01`, $lte: `${ano}-${mes}-31` } },
      "descricao valor data "
    );
    res.json(receitas);
  } catch (err) {
    res.status(500).json("Erro: " + err);
  }
};

exports.receita_nova = async function (req, res) {
  const dados = Requisicao(req.body.descricao, req.body.valor, req.body.data);

  try {
    const ehValido = await ValidacaoDuplicado(dados, Receita);

    if (ehValido) {
      const novaReceita = await new Receita(dados).save();

      try {
        res.json(novaReceita);
      } catch (err) {
        res.status(500).json("Erro: " + err);
      }
    } else {
      throw `A receita ${dados.descricao} já foi adicionada neste mês `;
    }
  } catch (err) {
    res.status(400).json("Erro: " + err);
  }
};

exports.receita_detalhes = async function (req, res) {
  try {
    const detalhes = await Receita.findById(
      req.params.id,
      "descricao valor data "
    );
    res.json(detalhes);
  } catch (err) {
    res.status(400).json("Erro: " + err);
  }
};

exports.receita_deletada = async function (req, res) {
  try {
    const deletar = await Receita.findByIdAndDelete(req.params.id);
    res.json(deletar);
  } catch (err) {
    res.status(400).json("Erro: " + err);
  }
};

exports.receita_atualizada = async function (req, res) {
  const dados = Requisicao(req.body.descricao, req.body.valor, req.body.data);

  try {
    const ehValido = await ValidacaoDuplicado(dados, Receita);

    if (ehValido) {
      try {
        const atualizar = await Receita.findOneAndUpdate(
          { _id: req.params.id },
          dados,
          { runValidators: true }
        );
        res.json(atualizar);
      } catch (err) {
        res.status(400).json("Erro: " + err);
      }
    } else {
      throw `A receita ${dados.descricao} já existe neste mês, tente outro.`;
    }
  } catch (err) {
    res.status(400).json("Erro: " + err);
  }
};
