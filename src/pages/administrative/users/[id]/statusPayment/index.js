import { useRouter } from "next/router";
import { Box, Text } from "../../../../../atoms";
import { TextInput } from "../../../../../organisms/contractStudent/contractStudent";
import { useAppContext } from "../../../../../context/AppContext";
import { api } from "../../../../../api/api";
import { useEffect, useState } from "react";
import { formatTimeStamp } from "../../../../../helpers";

export default function StuatusPayment() {
    const router = useRouter();
    const { id, enrollmentId } = router.query;
    const { setLoading, colorPalette } = useAppContext()
    const [userData, setUserData] = useState({})
    const [enrollmentData, setEnrollmentData] = useState({})
    const [responsiblePayerData, setResponsiblePayerData] = useState({})


    const handleUser = async () => {
        try {
            const response = await api.get(`/user/${id}`)
            console.log(response)
            const { data } = response
            if (response?.status === 200) {
                setUserData(data?.response)
                return data
            }
        } catch (error) {
            return error
        }
    }


    const handleEnrollment = async () => {
        try {
            const response = await api.get(`/student/enrrolments/${enrollmentId}`)
            const { data } = response
            if (response?.status === 200) {
                setEnrollmentData(data)
            }
        } catch (error) {
            return error
        }
    }

    const handleReponsiblePayment = async () => {
        try {
            const response = await api.get(`/responsible/${id}`)
            const { data } = response
            if (response?.status === 200) {
                setResponsiblePayerData(data)
            }
        } catch (error) {
            return error
        }
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            const user = await handleUser()
            if (user) {
                await handleEnrollment()
                await handleReponsiblePayment()
            }
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleItems()
    }, [])



    return (
        <Box sx={{maxWidth: '900px'}}>
            <Text>Usuario:</Text>
            <Text>{id}</Text>

            <Text>Matrícula:</Text>
            <Text>{enrollmentId}</Text>
            <Box>
                <TextInput label="Nome completo:" data={userData?.nome} />
                <Box sx={styles.containerValues}>
                    <TextInput label="Sexo:" data={userData?.genero} />
                    <TextInput label="Data do nascimento:" data={formatTimeStamp(userData?.nascimento)} />
                </Box>
                <Box sx={styles.containerValues}>
                    <TextInput label="RG:" data={userData?.rg} />
                    <TextInput label="CPF:" data={userData?.cpf} />
                    <TextInput label="Naturalidade:" data={userData?.naturalidade} />
                </Box>
                <TextInput label="Endereço:" data={userData?.rua} />
                <Box sx={styles.containerValues}>
                    <TextInput label="Número:" data={userData?.numero} />
                    <TextInput label="Complemento:" data={userData?.complemento} />
                    <TextInput label="Bairro:" data={userData?.bairro} />
                </Box>
                <Box sx={styles.containerValues}>
                    <TextInput label="CEP:" data={userData?.cep} />
                    <TextInput label="Cidade:" data={userData?.cidade} />
                    <TextInput label="Estado:" data={userData?.uf} />
                </Box>
                <Box sx={styles.containerValues}>
                    <TextInput label="País:" data={''} />
                    <TextInput label="Ocupação:" data={''} />
                    <TextInput label="Empresa/Instituição:" data={''} />
                </Box>
                <Box sx={styles.containerValues}>
                    <TextInput label="Tel. residencial:" data={''} />
                    <TextInput label="Celular:" data={userData?.telefone} />
                </Box>
                <TextInput label="E-mail:" data={userData?.email} />
                <Box sx={styles.containerValues}>
                    <TextInput label="Nome do pai:" data={userData?.nome_pai} />
                    <TextInput label="Nome da mãe:" data={userData?.nome_mae} />
                </Box>
                <Box sx={styles.containerValues}>
                    <TextInput label="Estado civil:" data={userData?.estado_civil} />
                    <TextInput label="Nome do conjuge:" data={userData?.conjuge} />
                </Box>
                <TextInput label="Em caso de emergência:" />
                <Box sx={styles.containerValues}>
                    <TextInput label="Cel. emergência:" data={userData?.telefone_emergencia} />
                </Box>

                <Box sx={{ flex: 1, marginTop: 5 }}>
                    <Box sx={{ backgroundColor: colorPalette.buttonColor, flex: 1 }}>
                        <TextInput label="Dados do(a) Responsável / Empresa / Pagante" style={{ title: { color: '#fff' } }} />
                    </Box>
                    <Box sx={styles.containerValues}>
                        <TextInput label="Empresa/Nome do Resp:" data={responsiblePayerData.nome_resp || ''} />
                        <TextInput label="Endereço:" data={responsiblePayerData.end_resp || userData?.rua} />
                    </Box>
                    <Box sx={styles.containerValues}>
                        <TextInput label="Número:" data={responsiblePayerData.numero_resp || userData?.numero} />
                        <TextInput label="CEP:" data={responsiblePayerData.cep_resp || userData?.cep} />
                        <TextInput label="Complemento:" data={responsiblePayerData.compl_resp || userData?.complemento} />
                    </Box>
                    <Box sx={styles.containerValues}>
                        <TextInput label="Bairro:" data={responsiblePayerData.bairro_resp || userData?.bairro} />
                        <TextInput label="Cidade:" data={responsiblePayerData.cidade_resp || userData?.cidade} />
                        <TextInput label="Estado:" data={responsiblePayerData.estado_resp || userData?.uf} />
                        <TextInput label="País:" data={responsiblePayerData.pais_resp || ''} />
                    </Box>
                    <TextInput label="E-mail:" data={responsiblePayerData.email_resp || userData?.email} />
                    <Box sx={styles.containerValues}>
                        <TextInput label="Telefone:" data={responsiblePayerData.telefone_resp || userData?.telefone} />
                        <TextInput label="CPF / CNPJ:" data={responsiblePayerData.cpf_resp || userData?.cpf} />
                        <TextInput label="RG:" data={responsiblePayerData.rg_resp || userData?.rg} />
                    </Box>
                </Box>
            </Box>
        </Box>
    )

}

export const styles = {
    containerValues: {
        display: 'flex', flexDirection: 'row', flex: 1
    },
}