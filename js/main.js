
/* Para que os form não atualize o site quando clicar em submit */

function handleForm(event) {
    event.preventDefault();
} 

let formEntrada = document.getElementById("calcularForm");
formEntrada.addEventListener('submit', handleForm);

let formAdd = document.getElementById("addLinhaForm");
formAdd.addEventListener('submit', handleForm);

/* Valores iniciais */

let chart = null

let curvaEmpuxo = null;

let dadosOriginais = [];

let tabela = document.getElementById("linhasTbody")

let arquivo_dados = document.getElementById('filesInput');

let arquivo_selecionado = ""

let nome_arquivo = "EntradaCriada.txt"

let linhasMarcadasIds = []

/* Componentes do html */

let mensagemManualLinha = document.getElementById("mensagemLinhaLabel")

let tbodyDadosEntrada = document.querySelector("tbody")

let legenda = document.getElementById("linhaManualLegend")

/* Funcoes */

function selecionadoArquivo() {

	this.arquivo_selecionado = arquivo_dados.files

	nome_arquivo = this.arquivo_selecionado[0].name

	document.getElementById('fileLabel').innerHTML = nome_arquivo

} 

/*Entrada com Form*/

function entrada() {

	let const_grav = 9.80665//document.getElementById("gravidadeInput").value;
	let massa_prop = document.getElementById("massaInput").value;
	let empuxo_min = document.getElementById("eminInput").value;

	curvaEmpuxo = new CurvaEmpuxo(parseFloat(const_grav), 
					parseFloat(massa_prop), parseFloat(empuxo_min))

	if (nome_arquivo != "EntradaCriada.txt")
		lerArquivoTxt(this.arquivo_selecionado, preencheArrayETabelaOriginal, function() {})

	return true

}

function lerArquivoTxt(evt, acaoIteracao, acaoFinal) {

	let files = evt

	let reader = new FileReader();

	reader.onload = function(event) {

		let conteudo = event.target.result;
		let linhas = conteudo.split('\n');
 
		for (x=0; x < linhas.length; x++) {

			let linha = linhas[x].split('	')

			acaoIteracao(linha)

		}

	};

	reader.onloadend = function(event) {
		acaoFinal()
	}

	reader.readAsText(files[0]);

}

/* Apresenta dados do arquivo FORCAxTEMPO */

function preencheArrayETabelaOriginal(linha) {

	let forca = parseFloat(linha[1])
	let tempo = parseFloat(linha[0])

	if (forca >= 0 && tempo >= 0)
		addLinhaTabela(null, tempo+"", forca)

}

function padronizaValores(str) {
	return String(str).replace(".", ",")
}

function despadronizaValores(str) {
	return String(str).replace(",", ".")
}

function addLinhaTabela(id, tempo, forca) {

	if (this.dadosOriginais == null)
		this.dadosOriginais = [[Number(tempo), forca]]
	else
		this.dadosOriginais.push([Number(tempo), forca])//adiciona na tabela

	let finalId = 0

	if (!isNaN(id) && id != null)
		finalId = id
	else if (this.dadosOriginais != null) 
		finalId = this.dadosOriginais.length-1

	let row = tabela.insertRow()

	let styleCheckbox = "<div class='checkDiv'>" +
				"<label class='checkLabel'>" +
					"<input type='checkbox' value='" + finalId + "Checkbox' onchange='marcaLinhaTabela(this)'/>" +
					"<span class='boxSpan'></span>" +
				"</label></div>"

	row.innerHTML = "<td class='checkTd'>" + styleCheckbox + "</td>"
			+ "<td>" + padronizaValores(tempo) + "</td>"
			+ "<td>" + padronizaValores(forca) + "</td>"

}

function isValidoTempoTabela(id, tempo) {

	if (id == null)
		id = this.dadosOriginais.length

	let valido = 0, 
		anterior = this.dadosOriginais[id-1], 
		proximo = this.dadosOriginais[id+1]

	if (anterior != undefined)
		valido = (Number(anterior[0]) < Number(tempo)) ? -1 : 0

	if (proximo != undefined)
		valido = (Number(proximo[0]) > Number(tempo)) ? 
			(valido == -1 ? 2 : 1) : valido

	/*

		Nenhum de acordo = 0
		De acordo somente com anterior = -1
		De acordo somente com proximo = 1
		De acordo com os dois = 2
	*/

	return valido

}

function existeLinhaTabela(tempo) {

	let existe = -1
				
	let encontrado = this.dadosOriginais.find(ti => Number(ti[0]) == Number(tempo))

	if (encontrado != undefined)
		existe = this.dadosOriginais.indexOf(encontrado)

	return existe

}

function isTabelaVazia() {
	return (this.dadosOriginais == undefined ||
			this.dadosOriginais.length == 0)
}

function addLinhaManualTabela(id, tempo, forca) {

	let valido = isTabelaVazia() ? true : (this.existeLinhaTabela(tempo) == -1)

	if (valido) {

		if (!isTabelaVazia() && isValidoTempoTabela(id, tempo) == 0) { 

			mensagemManualLinha.style.color = "red"
			mensagemManualLinha.innerHTML = "Você não pode colocar um tempo menor que o anterior!"

			return;

		}

		addLinhaTabela(id, tempo, forca)

		mensagemManualLinha.style.color = "green"
		mensagemManualLinha.innerHTML = "Adicionado com sucesso"

		alteraTempoForcaEntradasInput("", "", null)

	} else {

		mensagemManualLinha.style.color = "red"
		mensagemManualLinha.innerHTML = "Esse tempo já existe"

	}

}

function editaLinhaManualTabela(id, tempo, forca) {

	let validacao = this.isValidoTempoTabela(id, tempo)

	if ( validacao == 2 || 
		(validacao == -1 && id == this.dadosOriginais.length-1) ||
		(validacao == 0 && this.dadosOriginais.length == 1) ) {

		//adiciona na tabela local
		this.dadosOriginais[id] = [Number(tempo), Number(forca)]

		//adiciona no html
		this.tbodyDadosEntrada = document.querySelector("tbody")

		let dadosLinha = this.tbodyDadosEntrada.rows[this.linhasMarcadasIds[0]].getElementsByTagName("td")

		//Altera linha na coluna forca
		this.tbodyDadosEntrada.rows[this.linhasMarcadasIds[0]]
			.getElementsByTagName("td")[2].textContent = padronizaValores(forca)

		//Altera linha na coluna tempo
		this.tbodyDadosEntrada.rows[this.linhasMarcadasIds[0]].
			getElementsByTagName("td")[1].textContent = padronizaValores(tempo)

		mensagemManualLinha.style.color = "green"
		mensagemManualLinha.innerHTML = "Editado com sucesso"

	} else {

		mensagemManualLinha.style.color = "red"
		mensagemManualLinha.innerHTML = "Tempo inválido(existente, maior ou menor que o esperado)."

	}

}

function marcaLinhaTabela(checkbox) {

	let id = checkbox.value
	id = id.substring(0, id.length-"Checkbox".length)
	id = parseInt(id)

	if (checkbox.checked) {//Insere

		if (this.linhasMarcadasIds == null)
			this.linhasMarcadasIds = [id]
		else
			this.linhasMarcadasIds.push(id)

	} else
		this.linhasMarcadasIds.splice(this.linhasMarcadasIds.indexOf(id), 1)//remove

	alternaAcaoLinha(checkbox)

}

function alternaAcaoLinha(checkbox) {

	this.tbodyDadosEntrada = document.querySelector("tbody")

	let dados = []

	if (mensagemManualLinha.innerText != "")
		mensagemManualLinha.innerText = ""

	if (this.linhasMarcadasIds.length == 1) {//Se soh tiver uma linha selecionada, modo de edicao

		let dadosLinha = this.tbodyDadosEntrada.rows[this.linhasMarcadasIds[0]].getElementsByTagName("td")

		let forca = despadronizaValores(dadosLinha[2].textContent)
		let tempo = despadronizaValores(dadosLinha[1].textContent)

		dados = ["Editar Linha", "orange", //dados legenda
				tempo, forca, "Editar"] //dados html

	} else {//Se tiver mais de uma ou nenhuma, modo "padrao"(nova linha)

		dados = ["Nova Linha", "white", //dados legenda
				"", "", "Add"] //dados html

		mensagemManualLinha.innerHTML = ""

	}

	legenda.innerHTML = dados[0]
	legenda.style.color = dados[1]

	alteraTempoForcaEntradasInput(dados[2], dados[3], dados[4])

}

//Funcao chamada pelo componente form da tabela
function acaoEntradaLinha(nomeBotao, tempo, forca) {

	if (nomeBotao == "Add")
		this.addLinhaManualTabela(null, Number(tempo), Number(forca))
	else if (nomeBotao == "Editar")
		this.editaLinhaManualTabela(this.linhasMarcadasIds[0], Number(tempo), Number(forca))

}

function alteraTempoForcaEntradasInput(tempo, forca, acaoNome) {

	document.getElementById("tempoInput").value = tempo
	document.getElementById("forcaInput").value = forca

	document.getElementById("tempoInput").select()

	if (acaoNome != null)
		document.getElementById("confirmaLinhaButton").innerText = acaoNome

}

function excluirLinhasTabela() {

	this.tbodyDadosEntrada = document.querySelector("tbody")

	if (this.linhasMarcadasIds != null) {

		for (let i = 0; this.linhasMarcadasIds.length > i; i++) {

			this.tbodyDadosEntrada.deleteRow(this.linhasMarcadasIds[i])

			this.dadosOriginais.splice(this.linhasMarcadasIds[i], 1)

		}

		this.linhasMarcadasIds = []

	}

}

/* Processa resultados */
function processarDados() {

	curvaEmpuxo.geraCurvaEmpuxoCorrigida(this.dadosOriginais)

	apresentaDados(curvaEmpuxo)

	preencheGrafico()

	return true

}

function preencheGrafico() {

	let complemento = ""

	if (window.localStorage) {

		localStorage.clear()

		localStorage.setItem("titulo", "Curva Empuxo gerada de: " + nome_arquivo)
		localStorage.setItem("empuxos", curvaEmpuxo.forcas)
		localStorage.setItem("tempos", curvaEmpuxo.tempos)

	} else {

		complemento = "/?tamanho=" + curvaEmpuxo.forcas.length
		complemento += "&titulo=Curva,Empuxo,gerada,de:," + nome_arquivo.replace(".", ",")
		complemento += "&empuxos=" + curvaEmpuxo.forcas
		complemento += "&tempos=" + curvaEmpuxo.tempos

	}


	onAbreGrafico(complemento)

}

function onAbreGrafico(complemento) {

	if (!complemento)
		complemento = ""

	window.open("grafico.html"+complemento, '', 
			'left=0,top=0,width=1280,height=720,toolbar=0,scrollbars=0,status=0');

}

function onBaixaResultados() {

	let resultados = "", th = "", td = ""

	let tbody = document.getElementById("resultadosTbody")

	let linhas = tbody.getElementsByTagName("tr");

	for (let i = 0; linhas.length > i; i++) {

		th = linhas[i].getElementsByTagName("th")[0]
		th = (th.outerText || th.innerText)

		td = linhas[i].getElementsByTagName("td")[0]
		td = (td.outerText || td.innerText)

		resultados += th + " = " + td + "\n\n"

	}

	download(resultados, nome_arquivo.replace(".txt", "_resultados.txt"), "text/txt")

}

function apresentaDados(curvaEmpuxo) {
	
	alteraTextoTd("g", curvaEmpuxo.const_grav, "m/s^2")
	alteraTextoTd("m",  Number(curvaEmpuxo.massa_prop)*1000, "g")
	alteraTextoTd("Emin", curvaEmpuxo.empuxo_min, "N")
	alteraTextoTd("Emax", curvaEmpuxo.empuxo_max, "N")
	alteraTextoTd("tmax", curvaEmpuxo.temp_empuxo_max, "s")
	alteraTextoTd("tmaxt0", (curvaEmpuxo.temp_empuxo_max-curvaEmpuxo.t0), "s")
	alteraTextoTd("t0", curvaEmpuxo.t0, "s")
	alteraTextoTd("tf", curvaEmpuxo.tf, "s")
	alteraTextoTd("tq", curvaEmpuxo.tq, "s")
	alteraTextoTd("It", curvaEmpuxo.It, "Ns")
	alteraTextoTd("Emed", curvaEmpuxo.empuxo_medio, "N")
	alteraTextoTd("c", curvaEmpuxo.c, "m/s")
	alteraTextoTd("Is", curvaEmpuxo.Is, "s")
	alteraTextoTd("fm", curvaEmpuxo.fm, "g/s")
	alteraTextoTd("razao", curvaEmpuxo.razao, "%")
	alteraTextoTd("fator", curvaEmpuxo.fator, "%")
	alteraTextoTd("classe", curvaEmpuxo.classe + " " + Math.round(curvaEmpuxo.empuxo_medio), "")

}

function alteraTextoTd(nome, valor, unidade) {

	let td = document.getElementById(nome+"Td")

	if (!isNaN(valor))
		valor = Number(valor).toFixed(3)

	let texto = padronizaValores(valor) + " " + unidade

	td.innerText = texto+""

}

/* FUNCIONAMENTO DE BOTOES BASICOS: */

let voltar = document.getElementById("voltarButton")

function alteraEstadoArticle(nome, opacity, pointerEvents, animation, animation2, 
					animationName, animationDirection, 
					animationInterationCount, animationDuration) {

	let atual = document.getElementById(nome)
	atual.style.opacity = opacity
	atual.style.pointerEvents = pointerEvents

	atual.style.animation = animation
	atual.style.animation = animation2
	atual.offsetHeight;

	atual.style.animationName = animationName
	if (animationDirection != null)
		atual.style.animationDirection = animationDirection
	atual.style.animationInterationCount = animationInterationCount
	atual.style.animationDuration = animationDuration

}

let caminhosTelas = ["",//0 (inicio)
		    "menu-entrada", //1
		    "menu-ajuda", //2 (ajuda)
		    "menu-sobre", //3
		    "entrada-tabelaDados", //4
		    "tabelaDados-resultados"] //5

function onMudarArticle(botao, mudar) {

	if (!mudar)
		return

	if (botao == null)
		return;

	if (caminhosTelas[Number(botao)] == "")
		return;

	let nomes = caminhosTelas[Number(botao)].split("-")

	//Corrige mudanca para a volta
	caminhosTelas[0] = nomes[1] + "-" + nomes[0]

	//Article a ser ocutado
	alteraEstadoArticle(nomes[0], 0, "none", 'none', null, 
					"aparecendo", "reverse", 
					"1", "2s")

	//Article a ser apresentado
	alteraEstadoArticle(nomes[1], 1, "all", 'none', null, 
					"aparecendo", null, 
					"1", "2s")

}

function onAtualizaPagina(b) {

	document.location.reload(true)

}

