
class CurvaEmpuxo {

	constructor(const_grav, massa_prop, empuxo_min) {

		this.const_grav = const_grav //Constante g para kg
		this.massa_prop = massa_prop/1000 //Massa do propelente
		this.empuxo_min = empuxo_min //Empuxo minimo

		this.inicializa()

	}

	inicializa() {

		this.tempos = [] //Todos os tempos
	    	this.forcas = [] //Todas as forcas
	    	this.empuxo_max = 0 //Empuxo maximo
	    	this.temp_empuxo_max = 0 //Tempo do Empuxo maximo

		this.empuxo_medio = 0 //Empuxo medio
		this.c = 0 //Velocidade de exaustao efetivo medio
		this.Is = 0 //Impulso especifico
		this.fm = 0 //Fluxo de massa medio
		this.razao = 0 //Razao (1000 * massa_prop/tq)
		this.t0 = 1000 //Tempo inicial (inicializado com 1000)
		this.It = 0 //Impulso total
		this.tq = 0 //Tempo de queima
		this.tf = 0 //Tempo final

		//counts
		this.length = 0

	}

	addForcaTempo(forca, tempo) {
		this.forcas[this.length] = forca
		this.tempos[this.length] = tempo
		this.length++
	}

	getForcaLast() {
		return this.length == 0 ? 
			0 : this.forcas[this.length-1]
	}

	getTempoLast() {
		return this.length == 0 ? 
			0 : this.tempos[this.length-1]
	}

	determinaEmpuxoMaximo(tempoForcaArray) {

		let t = 0, E = 0

		for (let i = 0; tempoForcaArray.length > i; i++) {

			t = tempoForcaArray[i][0]
			E = tempoForcaArray[i][1]

			if (E > this.empuxo_max) {
				this.empuxo_max = E
				this.temp_empuxo_max = t
			}

		}

	}

	corrigeTempoExtremo(t, E, ta, Ea, empuxo_min) {//Tempos extremos: tempo inicial(t0) e tempo final(tf)
		return ta + (t-ta)*(empuxo_min-Ea)/(E-Ea)
	}

	geraCurvaEmpuxoCorrigida(tempoForcaArray) {

	//INICIALIZA

		this.inicializa()

		let fep = new FisicaEmpuxoPropelente()

		this.determinaEmpuxoMaximo(tempoForcaArray)

		this.fator = fep.criaFator(this.empuxo_min, this.empuxo_max)

	//MINERA DADO BRUTO

		let flag = 0, 
			fim = 0, 
			ta = 0, 
			Ea = 0, 
			E = 0, 
			t = 0

		for (let i = 0; tempoForcaArray.length > i; i++) {

			t = tempoForcaArray[i][0]
			E = tempoForcaArray[i][1]

			//if (Number(E) == 0 && this.tempos.length == 0)
			//	this.addForcaTempo(E, Number(t).toFixed(2))

			if ( E >= this.empuxo_min && Ea < this.empuxo_min/* && fim != 1 */) {//determina tempo inicial
				this.t0 = this.corrigeTempoExtremo(t, E, ta, Ea, this.empuxo_min)
				fim = 1
			}

			if ( E <= this.empuxo_min && Ea > this.empuxo_min && fim == 1 ) {//determina tempo final
				this.tf = this.corrigeTempoExtremo(t, E, ta, Ea, this.empuxo_min)
				flag = 1
			}

			if ( t > this.t0 && flag == 0 ) {//adiciona tempo e forca corrigidos

				this.addForcaTempo(E, Number((t-this.t0)).toFixed(2))

				if ( t > this.t0 && ta < this.t0 )
					this.It = this.It + (E+this.empuxo_min)*(t-this.t0)/2
				else
					this.It = this.It + (E+Ea)*(t-ta)/2

			}

			ta = t
			Ea = E

			if (flag == 1)//encerra loop
				break;

		}

	//MAIS CALCULOS PARA OBTER OUTROS DADOS

		this.It = fep.calculaImpulsoTotal(this.It, this.empuxo_min, this.tf, Ea, ta)

		this.tq = fep.calculaTempoDeQueima(this.t0, this.tf)

		this.empuxo_medio = fep.calculaEmpuxoMedio(this.It, this.tq)

		this.c = fep.calculaVelocidadeDeExaustaoEfetivaMedia(this.It, this.massa_prop)

		this.Is = fep.calculaImpulsoEspecificoMedio(this.c, this.const_grav)

		this.fm = fep.calculaFluxoDeMassaMedio(this.massa_prop, this.tq)

		this.razao = fep.calculaRazao(this.empuxo_max, this.empuxo_medio)

		this.classe = this.classificaMotor(this.It)

	}

	classificaMotor(It) {

		let classe = "null"

		if (   0.0000 < It && It <=   0.3125 ) classe = '1/8A'
		if (   0.3125 < It && It <=   0.6250 ) classe = '1/4A'
		if (   0.6250 < It && It <=   1.2500 ) classe = '1/2A'
		if (   1.2500 < It && It <=   2.5000 ) classe = 'A'
		if (   2.5000 < It && It <=   5.0000 ) classe = 'B'
		if (   5.0000 < It && It <=  10.0000 ) classe = 'C'
		if (  10.0000 < It && It <=  20.0000 ) classe = 'D'
		if (  20.0000 < It && It <=  40.0000 ) classe = 'E'
		if (  40.0000 < It && It <=  80.0000 ) classe = 'F'
		if (  80.0000 < It && It <= 160.0000 ) classe = 'G'
		if ( 160.0000 < It && It <= 320.0000 ) classe = 'H'
		if ( 320.0000 < It && It <= 640.0000 ) classe = 'I'

		return classe

	}

}

