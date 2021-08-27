
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

let chart = null
let titulo = "Tempo x Empuxo"
let saidaTxt = "     *** CURVA TEMPO x EMPUXO ***\n" + "  t (s)     empuxo (N)\n"
let dados = [[0, 0],   [1, 10],  [2, 23]]

getDados()

function getDados() {

	let forcas = "", tempos = ""

	if (window.localStorage) {

		forcas = localStorage.getItem("empuxos").split(",")
		tempos = localStorage.getItem("tempos").split(",")
		titulo = localStorage.getItem("titulo")

	} else {

		let url = window.location.href

		console.log("url = " + url)

		let query = url ? url.split('?')[1] : window.location.search.slice(1) 

		const urlParams = new URLSearchParams(query)

		forcas = urlParams.get('empuxos')
		tempos = urlParams.get('tempos')
		titulo = urlParams.get('titulo')

	}

	let linhas = null

	for (let i = 0; forcas.length > i; i++) {

		if (linhas == [] || linhas == null)
			linhas = [ [Number(tempos[i]), Number(forcas[i])] ]
		else
			linhas.push([Number(tempos[i]), Number(forcas[i])])

		saidaTxt += "  " + String(Number(tempos[i]).toFixed(4)).replace(".", ",") + "    " 
				+ String(Number(forcas[i]).toFixed(2)).replace(".", ",") + "\n"

	}

	dados = linhas

}


function drawChart() {
	let data = new google.visualization.DataTable();
	data.addColumn('number', 'X');
	data.addColumn('number', 'Empuxo');

	data.addRows(dados);

	let options = {
		width: 1280,
		height: 720,
		title: titulo,
		hAxis: {
			title: 'Tempo (s)'
		},
		vAxis: {
			title: 'Empuxo (N)'
		}
	};

	chart = new google.visualization.LineChart(document.getElementById('chart_div'));

	chart.draw(data, options);

}

function baixaTxtCurvaEmpuxoCorrigida() {

	download(saidaTxt, titulo.replace(".txt", "_saida.txt"), "text/txt")

}

function baixaSVG() {

	let div = document.getElementById('chart_div')

	let svg = div.getElementsByTagName('svg')[0].outerHTML

	if (!svg.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
		svg = svg.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
	}   

	if(!svg.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
		svg = svg.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');   
	}

	download(svg, "imagem.svg", "image/svg+xml")

}

function baixaPNG() {

	let dados = chart.getImageURI()

	download(dados, "imagem.png", "image/png")

}
