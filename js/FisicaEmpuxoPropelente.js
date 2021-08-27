
class FisicaEmpuxoPropelente {

	criaFator(empuxo_minimo, empuxo_maximo) {
		return 100 * empuxo_minimo / empuxo_maximo
	}

	calculaImpulsoTotal(impulso_total_atual, empuxo_minimo, tempo_original_final, Ea, ta) {
		return Number(impulso_total_atual) + Number((empuxo_minimo+Ea)) * (tempo_original_final-ta) / 2
	}

	calculaTempoDeQueima(tempo_original_inicial, tempo_original_final) {
		return tempo_original_final - tempo_original_inicial
	}

	calculaEmpuxoMedio(impulso_total, tempo_de_queima) {
		return impulso_total / tempo_de_queima
	}

	calculaVelocidadeDeExaustaoEfetivaMedia(impulso_total, massa_do_propelente) {
		return impulso_total / massa_do_propelente
	}

	calculaImpulsoEspecificoMedio(velocidade_de_exaustao_efetiva_media, aceleracao_gravitacional) {
		return velocidade_de_exaustao_efetiva_media / aceleracao_gravitacional
	}

	calculaFluxoDeMassaMedio(massa_do_propelente, tempo_de_queima) {
		return 1000 * massa_do_propelente / tempo_de_queima
	}

	calculaRazao(empuxo_maximo, empuxo_medio) {
		return empuxo_maximo / empuxo_medio
	}

}

