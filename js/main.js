
// js/main.js
//Guarda todos os produtos que vieram do JSON 
let todosProdutos = [];

//atalho para não ficar escrevendo toda hora $(Jquery)
const $lista = $('#lista-produtos');
const $contador = $('#contador-produtos');
const $busca = $('#input-busca');
const $categorias = $('#filtro-categoria');
const $ordenacao = $('#select-ordenacao');
const $modal = $('#modal-detalhes');
const $modalConteudo = $('#modal-conteudo');

//Só roda quando a página html estiver pronta 
$(document).ready(function () {

    // 1. Botão Rosa grande carregar os produtos 
    $('#btn-carregar').on('click', function () {
        $(this).text('Carregando...').prop('disabled', true);
        carregarProdutos(); // executa carregamento assíncrono dos produtos
    });

    // Filtra os produtos em tempo real conforme o usuário digita 
    $busca.on('keyup', filtrar);
    
    //clica em uma categoria- marca como ativa e filtra 
    $categorias.on('click', 'button', function () {
        $categorias.find('button').removeClass('ativo');
        $(this).addClass('ativo');
        filtrar();
    });

    //Muda a ordenação do filtro da página 
    $ordenacao.on('change', filtrar);

    // Botão para Limpar filtros 
    $('#limpar-filtros').on('click', function () {
        $busca.val(''); //limpa busca
        $categorias.find('button').removeClass('ativo');
        $categorias.find('button[data-cat="Todas"]').addClass('ativo');
        $ordenacao.val('');
        filtrar();
    });

    // Clica em "Ver detalhes" abre o modal
    $(document).on('click', '.btn-detalhes', function () {
        const id = parseInt($(this).data('id'));
        const p = todosProdutos.find(x => x.id === id);
        if (p) abrirModal(p);
    });

    //fecha o modal " ver detalhes"clicando no x ou fora
    $(document).on('click', '#fechar-modal, .modal', function (e) {
        if (e.target === this || $(e.target).hasClass('close')) {
            $modal.fadeOut(300);
        }
    });
});
//Busca os produtos no arquivo JSON 

function carregarProdutos() {
    $contador.html('<div class="loading-spinner"></div> Carregando catálogo...');

    
   // AJAX
   //Função: Carrega produtos do Arquivo - produtos.json via AJAX
    $.ajax({
        url: 'data/produtos.json',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            todosProdutos = data.produtos;
            gerarBotoesCategoria();
            filtrar();

            // Esconde botão e mostra filtros
            $('#btn-carregar').hide();
            $('#painel-filtros').fadeIn(600);
            $contador.text(`Catálogo carregado: ${todosProdutos.length} produtos`);
        },
        error: function () {
            $contador.html('Erro ao carregar produtos.json. Verifique o caminho.');
            $('#btn-carregar').text('Tentar novamente').prop('disabled', false);
        }
    });
}

function gerarBotoesCategoria() {
    const cats = ['Todas', ...new Set(todosProdutos.map(p => p.categoria))];
    $categorias.empty();
    cats.forEach(cat => {
        const ativo = cat === 'Todas' ? 'ativo' : '';
        $categorias.append(`<button class="btn-categoria ${ativo}" data-cat="${cat}">${cat}</button>`);
    });
}

function filtrar() {
    let lista = [...todosProdutos];

    // Busca por nome
    const termo = $busca.val().toLowerCase();
    if (termo) {
        lista = lista.filter(p => p.nome.toLowerCase().includes(termo));
    }

    // Filtro por categoria
    const catAtiva = $categorias.find('button.ativo').data('cat');
    if (catAtiva && catAtiva !== 'Todas') {
        lista = lista.filter(p => p.categoria === catAtiva);
    }

    // Ordenação
    const ordem = $ordenacao.val();
    if (ordem === 'preco_asc') lista.sort((a, b) => a.preco - b.preco);
    if (ordem === 'preco_desc') lista.sort((a, b) => b.preco - a.preco);
    if (ordem === 'nome_asc') lista.sort((a, b) => a.nome.localeCompare(b.nome));
    if (ordem === 'nome_desc') lista.sort((a, b) => b.nome.localeCompare(a.nome));
 //Exibe o resultado final 
    exibirProdutos(lista);
}
//Exibe os produtos na tela (cria os cards dinamicamente)
function exibirProdutos(produtos) {
    $lista.empty();

    if (produtos.length === 0) {
        $lista.html('<p class="vazio">Nenhum produto encontrado.</p>');
        $contador.text('0 produtos');
        return;
    }
   //cria um car para cada produto

    $.each(produtos, function (i, p) {
        const card = `
            <article class="produto">
                <img src="${p.imagem}" alt="${p.nome}">
                <h3>${p.nome}</h3>
                <p class="cat">${p.categoria}</p>
                <p class="preco">R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
                <button class="btn-detalhes" data-id="${p.id}">Ver Detalhes</button>
            </article>
        `;
        $lista.append(card).find('.produto').last().hide().fadeIn(300);
    });

    $contador.text(`Exibindo ${produtos.length} de ${todosProdutos.length} produtos`);
}


//Abre o modal com detalhes completos do produtos 

function abrirModal(p) {
    $modalConteudo.html(`
        <span class="close" id="fechar-modal">&times;</span>
        <img src="${p.imagem}" alt="${p.nome}">
        <h2>${p.nome}</h2>
        <p><strong>Categoria:</strong> ${p.categoria}</p>
        <p class="preco-modal">R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
        <p><strong>Descrição:</strong> ${p.descricao}</p>
        <p><strong>Estoque:</strong> ${p.estoque} unidades</p>
    `);
    $modal.fadeIn(300);  //animação de abertura 
}