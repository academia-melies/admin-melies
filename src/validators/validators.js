import { emailValidator } from "../helpers"

export const checkRequiredFields = (userData, alert) => {
    if (!userData?.nome) {
        alert?.error('O campo nome é obrigatório')
        return false
    }
    if (!userData?.email) {
        alert?.error('O campo email é obrigatório')
        return false
    }
    if (!emailValidator(userData?.email)) {
        alert?.error('O e-mail inserido parece estar incorreto.')
        return false
    }

    if (userData?.senha !== userData?.confirmar_senha) {
        alert?.error('As senhas não correspondem. Por favor, verifique novamente.')
        return false
    }

    if (!userData?.telefone) {
        alert?.error('O campo telefone é obrigatório')
        return false
    }

    if (!userData?.perfil) {
        alert?.error('O campo perfil é obrigatório')
        return false
    }

    if (!userData?.status) {
        alert?.error('O campo status é obrigatório')
        return false
    }

    if (!userData?.naturalidade) {
        alert?.error('O campo naturalidade é obrigatório')
        return false
    }

    if (!userData?.pais_origem) {
        alert?.error('O campo País de origem é obrigatório')
        return false
    }

    if (!userData?.nacionalidade) {
        alert?.error('O campo nacionalidade é obrigatório')
        return false
    }

    if (!userData?.cor_raca) {
        alert?.error('O campo Cor e raça é obrigatório')
        return false
    }

    if (!userData?.genero) {
        alert?.error('O campo gênero é obrigatório')
        return false
    }

    if (!userData?.deficiencia) {
        alert.error('O campo deficiência é obrigatório')
        return false
    }

    if (!userData?.estado_civil) {
        alert.error('O campo Estado cívil é obrigatório')
        return false
    }

    if (!userData?.escolaridade) {
        alert.error('O campo escolaridade é obrigatório')
        return false
    }

    if (!userData?.escolaridade) {
        alert.error('O campo escolaridade é obrigatório')
        return false
    }

    if (!userData?.cep) {
        alert.error('O campo CEP é obrigatório')
        return false
    }

    if (!userData?.numero) {
        alert.error('O campo numero é obrigatório')
        return false
    }

    if (!userData?.cidade) {
        alert.error('O campo cidade é obrigatório')
        return false
    }

    if (!userData?.rg) {
        alert.error('O campo RG é obrigatório')
        return false
    }

    if (!userData?.cpf) {
        alert.error('O campo CPF é obrigatório')
        return false
    }

    return true
}