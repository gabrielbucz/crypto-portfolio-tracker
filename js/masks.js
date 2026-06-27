// masks.js — jQuery Mask Plugin + manipulação DOM com jQuery

$(document).ready(function () {

    // ID 21 — Plugin jQuery Mask
    $('#input-quantidade').mask('0000000000#', { reverse: true });
    $('#input-preco').mask('#.##0,00', { reverse: true });


    // ID 20 — Manipulação de DOM e evento com jQuery
    $('#btn-adicionar').on('mouseenter', function () {
        $(this).addClass('btn-success').removeClass('btn-primary');
    }).on('mouseleave', function () {
        $(this).addClass('btn-primary').removeClass('btn-success');
    });

    $('#select-moeda').on('change', function () {
        const moeda = $(this).find('option:selected').text();
        $('#input-quantidade').attr('placeholder', `Qtd. de ${moeda.split('—')[1]?.trim() ?? 'moeda'}`);
    });

});