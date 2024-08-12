import { useRouter } from "next/router";
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../../atoms";
import { useAppContext } from "../../../../../context/AppContext";
import { api } from "../../../../../api/api";
import { useEffect, useRef, useState } from "react";
import { formatTimeStamp } from "../../../../../helpers";
import { SectionHeader } from "../../../../../organisms";
import { ContractStudentComponent } from "../../../../../organisms/contractStudent/contractStudent";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { bodyContractEnrollment, responsiblePayerDataTable, userDataTable } from "../../../../../helpers/bodyContract";

export default function GenerateContract() {
    const router = useRouter();
    const { id, enrollmentId } = router.query;
    const { setLoading, colorPalette, alert, theme, user } = useAppContext()
    const [userData, setUserData] = useState({})
    const [enrollmentData, setEnrollmentData] = useState({})
    const [responsiblePayerData, setResponsiblePayerData] = useState({})
    const [installmentsData, setInstallmentsData] = useState([])
    const contractService = useRef()
    pdfMake.vfs = pdfFonts.pdfMake.vfs

    const handleUser = async () => {
        try {
            const response = await api.get(`/user/${id}`)
            const { data } = response
            if (response?.status === 200) {
                setUserData(data)
                return data
            }
        } catch (error) {
            return error
        }
    }


    const handleEnrollment = async () => {
        try {
            const response = await api.get(`/student/enrrolment/${enrollmentId}`)
            const { data } = response
            if (response?.status === 200) {
                setEnrollmentData(data)
            }
        } catch (error) {
            console.log(error)
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

    const handleInstallmentEnrollment = async () => {
        try {
            const response = await api.get(`/student/installment/enrollment/${enrollmentId}`)
            const { data } = response
            if (response?.status === 200) {
                setInstallmentsData(data)
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
                await handleInstallmentEnrollment()
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


    const handleUploadContract = async (pdfBlob, contractData) => {
        try {
            const formData = new FormData();
            formData.append('file', pdfBlob, contractData?.name_file);

            const fileResponse = await api.post(`/student/enrrolments/contract/upload?matricula_id=${enrollmentId}`, formData)
            let file;
            console.log('criou contrato', fileResponse)
            if (fileResponse?.data) {
                const { fileId } = fileResponse?.data
                file = fileId
            }

            return file
        } catch (error) {
            console.log('erro ao criar contrato para assinatura: ', error)
        }
    }


    const handleSendContractSigners = async ({ fileId, contractData }) => {
        try {
            const sendDoc = await api.post('/contract/enrollment/signatures/upload', { signerId: id, fileId, contractData, enrollmentId, responsiblePayerData })
            console.log('contrato enviado para assinatura', sendDoc)

            return sendDoc?.status
        } catch (error) {
            console.log('error enviar contrato para assinatura: ', error)
        }
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    let nameContract = ``;
    if (enrollmentData?.nome_curso) nameContract += `${enrollmentData?.nome_curso}_`;
    if (enrollmentData?.modalidade_curso) nameContract += `${enrollmentData?.modalidade_curso}`;
    if (enrollmentData?.nome_turma) nameContract += ` (${enrollmentData?.nome_turma}-${enrollmentData?.modulo}ºMódulo)`;

    const handleGenerateContract = async () => {
        try {
            let nameContract = `contrato_ `;
            if (userData?.nome) nameContract += `${userData?.nome}_`;
            if (enrollmentData?.nome_turma) nameContract += `${enrollmentData?.nome_turma}-${enrollmentData?.modulo}º MODULO_`;
            if (enrollmentData?.nome_curso) nameContract += `${enrollmentData?.nome_curso}_`;
            if (enrollmentData?.modalidade_curso) nameContract += `${enrollmentData?.modalidade_curso}`;

            if (enrollmentData?.cursando_dp === 1) {
                nameContract = `contrato_DP_${userData?.nome}_${enrollmentData?.nome_turma}-${enrollmentData?.modulo}º MODULO_`;
                if (enrollmentData?.nome_curso) nameContract += `${enrollmentData?.nome_curso}_EAD`;
            }

            let pdfBlob = await handleGeneratePdf();
            // const pdfBase64 = await convertBlobToBase64(pdfBlob);
            // const blob = base64toBlob(pdfBase64, 'application/pdf');
            // const blobUrl = URL.createObjectURL(blob);
            // window.open(blobUrl, '_blank');

            let contractData = {
                name_file: nameContract,
                size: null,
                key_file: null,
                location: null,
                usuario_id: id,
                status_assinaturas: 'Pendente de assinatura',
                modulo: enrollmentData?.modulo,
                matricula_id: enrollmentId,
                token_doc: null,
                external_id: null,
                deletado: 0,
                dt_deletado: null
            }

            const fileId = await handleUploadContract(pdfBlob, contractData)
            if (fileId) {
                const sendDoc = await handleSendContractSigners({ fileId, contractData })
                if (sendDoc === 200) {
                    alert.success('Contrato gerado e enviado por e-mail para assinatura.')
                } else {
                    alert.error('Houve um erro ao enviar contrato para assinatura.')
                    return false
                }
                router.push(`/administrative/users/${id}`)
            } else {
                alert.error('Houve um erro ao gerar contrato.')
                return false
            }

        } catch (error) {
            console.error(error);
        }
    };

    const base64toBlob = (base64, contentType) => {
        const byteCharacters = atob(base64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };

    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]); // Retorna apenas a parte do Base64
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    async function loadImageAsDataURL(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, image.width, image.height);
                const dataURL = canvas.toDataURL('image/jpeg'); // Pode ser 'image/png' dependendo do formato da imagem
                resolve(dataURL);
            };
            image.onerror = reject;
            image.src = url;
        });
    }

    const handleGeneratePdf = async () => {
        try {
            return new Promise(async (resolve, reject) => {

                const currentDate = new Date();
                const options = {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                };
                const formattedDate = new Intl.DateTimeFormat("pt-BR", options).format(currentDate);
                const imageUrl = '/background/doc_melies_contrato_compacto.jpeg';
                const imageDataURL = await loadImageAsDataURL(imageUrl);

                try {
                    const documentDefinition = {
                        background: function (currentPage, pageSize) {
                            return {
                                image: imageDataURL,
                                width: pageSize.width,
                                height: pageSize.height,
                                absolutePosition: { x: 0, y: 0 },
                                opacity: 0.5, // Opacidade da marca d'água (opcional)
                            };

                        },
                        content: [
                            { text: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS', fontSize: 16, alignment: 'center', fontFamily: 'MetropolisBold', bold: true },

                            { text: '', margin: [0, 20, 0, 20], },
                            {
                                table: {
                                    widths: ['30%', '70%'],
                                    body: userDataTable(userData).map(row => [
                                        { text: row?.title, bold: true, fontFamily: 'Metropolis Regular' },
                                        { text: row?.value || '', fontFamily: 'MetropolisBold' },
                                    ]),
                                    layout: {
                                        hLineWidth: function (i, node) {
                                            return i === 0 ? 0 : 1;
                                        },
                                        vLineWidth: function (i, node) {
                                            return 0;
                                        },
                                    },
                                },
                            },

                            {
                                text: 'Dados do(a) Responsável / Empresa / Pagante',
                                fontFamily: 'MetropolisBold',
                                background: '#F49519',
                                bold: true,
                                alignment: 'center',
                                width: '100%',
                                margin: [0, 20, 0, 20],
                            },

                            {
                                table: {
                                    widths: ['30%', '70%'],
                                    body: responsiblePayerDataTable(responsiblePayerData, userData).map(row => [
                                        { text: row.title, bold: true },
                                        { text: row.value || '' },
                                    ]),
                                    layout: {
                                        hLineWidth: function (i, node) {
                                            return i === 0 ? 0 : 1;
                                        },
                                        vLineWidth: function (i, node) {
                                            return 0;
                                        },
                                    },
                                },
                            },



                            { text: nameContract || 'Dados de pagamento', bold: true, margin: [0, 40, 0, 20], alignment: 'center', fontFamily: 'MetropolisBold' },

                            {
                                margin: [80, 0],

                                table: {
                                    widths: ['45%', '50%'],
                                    body: [
                                        userData?.nome ? ['Aluno:', userData?.nome] : [],
                                        ['Resp. pagante:', responsiblePayerData?.nome_resp || userData?.nome],
                                        [`Valor total do ${enrollmentData?.nivel_curso === 'Pós-Graduação' ? 'curso' : 'semestre'}: `, formatter.format(enrollmentData?.valor_matricula)],
                                        ['Disciplinas dispensadas:', enrollmentData?.qnt_disci_disp],
                                        enrollmentData?.qnt_disci_dp > 0 && ['Disciplinas DP:', enrollmentData?.qnt_disci_dp],
                                        enrollmentData?.desc_disp_disc > 0 && ['Disciplinas dispensadas - Desconto (R$):', formatter.format(enrollmentData.desc_disp_disc)],
                                        enrollmentData?.desc_adicional && ['DESCONTO (adicional):', (formatter.format(enrollmentData?.desc_adicional || 0)) || []]
                                            (enrollmentData?.valor_tl_desc > 0) && ['DESCONTO TOTAL:', formatter.format(parseFloat(enrollmentData?.valor_tl_desc))],
                                        contractValue > 0 ? ['VALOR A PAGAR:', formatter.format(contractValue)] : ['VALOR A PAGAR:', formatter.format(contractValue)],
                                    ].filter(row => row.length > 0),
                                    layout: {
                                        hLineWidth: function (i, node) {
                                            return i === 0 ? 0 : 1;
                                        },
                                        vLineWidth: function (i, node) {
                                            return 0;
                                        },
                                    },
                                },
                            },

                            ...(installmentsData?.length > 0 ? [
                                { text: 'Forma de pagamento escolhida:', bold: true, margin: [0, 40, 0, 10], alignment: 'center' },
                                { text: `Pagante/Pagamento:`, bold: true, margin: [10, 20, 10, 20], alignment: 'center' },
                                createPaymentTable(installmentsData)
                            ] : []),
                            { text: '', margin: [10, 30, 10, 30] },
                            ...(Array.isArray(bodyContractEnrollment) ? bodyContractEnrollment.map((body, index) => {
                                const title = body?.title ? true : false;
                                return [
                                    { text: `${body?.text}`, fontFamily: title ? 'MetropolisBold' : 'Metropolis Regular', margin: title ? [10, 30, 10, 10] : [10, 10], bold: title ? true : false, fontSize: title ? 12 : 10 },
                                ];
                            }) : []),
                            { text: `São Paulo, ${formattedDate}`, margin: [80, 30, 10, 10], fontFamily: 'MetropolisBold', }
                        ],
                        styles: {
                            header: { fontSize: 18, bold: true },
                        },
                        pageMargins: [40, 80, 30, 80],

                    };

                    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
                    const pdfBlob = await new Promise((pdfResolve) => {
                        pdfDocGenerator.getBlob(pdfResolve);
                    });

                    resolve(pdfBlob);
                } catch (error) {
                    console.log(error)
                    reject(error);
                }
            });

        } catch (error) {
            console.log(error)
        }
    };


    const createPaymentTable = (paymentData) => {
        try {

            const tableBody = [];
            tableBody.push([
                { text: 'Nº Parcela', style: 'tableHeader', fillColor: '#F49519' },
                { text: 'Forma', style: 'tableHeader', fillColor: '#F49519' },
                { text: 'Valor da Parcela', style: 'tableHeader', fillColor: '#F49519' },
                { text: 'Data de Pagamento', style: 'tableHeader', fillColor: '#F49519' },
            ]);

            paymentData?.forEach((pay) => {
                tableBody.push([
                    pay?.n_parcela,
                    pay?.forma_pagamento,
                    formatter.format(pay?.valor_parcela),
                    formatTimeStamp(pay?.vencimento)
                ]);
            });


            const tableDefinition = {
                table: {
                    widths: ['auto', 'auto', 'auto', 'auto'],
                    body: tableBody,
                    styles: {
                        fontSize: 13
                    },
                    alignment: 'center'
                },
                margin: [100, 0, 0, 0],
                layout: {
                    hLineWidth: function (i, node) {
                        return i === 0 ? 0 : 1;
                    },
                    vLineWidth: function (i, node) {
                        return 0;
                    },
                },
            };

            return tableDefinition;
        } catch (error) {
            console.log(error)
        }
    };


    const contractValue = installmentsData?.length > 0 ? installmentsData?.filter(item => item?.status_parcela !== 'Cancelado')
        ?.map(item => item?.valor_parcela)?.reduce((acc, curr) => acc += curr, 0) : 0

    return (
        <>
            <SectionHeader
                perfil={userData?.nome || 'aluno'}
                title={'Contrato de Matrícula'}
            />

            <Text bold title>Pré vizualização do Contrato</Text>
            <ContentContainer>
                <div ref={contractService} style={{ padding: '0px 40px' }}>
                    <ContractStudentComponent
                        userData={userData}
                        responsiblePayerData={responsiblePayerData}
                    >

                        <ContentContainer style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            boxShadow: 'none',
                            alignItems: 'center',
                            marginTop: 25
                        }}>
                            <Text bold>{nameContract || 'Dados de pagamento'}</Text>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: '8px',
                                alignItems: 'start',
                                width: '70%',
                            }}>

                                <Box sx={styles.containerValues}>
                                    <Text small style={styles.textDataPayments} bold>Aluno:</Text>
                                    <Text small style={styles.textDataPayments}>{userData?.nome}</Text>
                                </Box>
                                <Box sx={styles.containerValues}>
                                    <Text small style={styles.textDataPayments} bold>Resp. pagante:</Text>
                                    <Text small style={styles.textDataPayments}>{responsiblePayerData?.nome_resp || userData?.nome}</Text>
                                </Box>
                                {enrollmentData?.cursando_dp === 1 && <Box sx={styles.containerValues}>
                                    <Text small style={styles.textDataPayments} bold>Disciplinas DP:</Text>
                                    <Text small style={styles.textDataPayments}>{enrollmentData?.qnt_disc_dp || 0}</Text>
                                </Box>}
                                <Box sx={styles.containerValues}>
                                    <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas:</Text>
                                    <Text small style={styles.textDataPayments}>{enrollmentData?.qnt_disc_disp}</Text>
                                </Box>
                                {enrollmentData?.desc_disp_disc > 0 ?
                                    <Box sx={styles.containerValues}>
                                        <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas - Desconto (R$):</Text>
                                        <Text small style={styles.textDataPayments}>{formatter.format(enrollmentData?.desc_disp_disc)}</Text>
                                    </Box>
                                    : <></>
                                }
                                {enrollmentData?.desc_adicional ?
                                    <Box sx={styles.containerValues}>
                                        <Text small style={styles.textDataPayments} bold>DESCONTO (adicional):</Text>
                                        <Text small style={styles.textDataPayments}>{formatter.format(enrollmentData?.desc_adicional) || '0'}</Text>
                                    </Box> : <></>
                                }

                                {enrollmentData?.valor_tl_desc > 0 ?
                                    <Box sx={styles.containerValues}>
                                        <Text small style={styles.textDataPayments} bold>DESCONTO TOTAL:</Text>
                                        <Text small style={styles.textDataPayments}>{formatter.format(enrollmentData?.valor_tl_desc)}</Text>
                                    </Box> : <></>
                                }
                                {contractValue &&
                                    <Box sx={{ ...styles.containerValues, borderRadius: '0px 0px 8px 8px' }}>
                                        <Text small style={styles.textDataPayments} bold>VALOR A PAGAR:</Text>
                                        <Text small style={styles.textDataPayments}>
                                            {formatter.format(contractValue)}
                                        </Text>
                                    </Box>
                                }
                            </Box>
                        </ContentContainer>



                        <ContentContainer style={{ display: 'flex', flexDirection: 'column', gap: 3, boxShadow: 'none', alignItems: 'center', marginBottom: 25 }}>
                            <Text bold>Forma de pagamento escolhida:</Text>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Text bold>Pagante/Pagamento: </Text>
                            </Box>
                            <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, width: '100%' }}>

                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                            <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Nº Parcela</th>
                                            <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Forma</th>
                                            <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Valor da Parcela</th>
                                            <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Data de Pagamento</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ flex: 1 }}>
                                        {installmentsData?.map((pay, payIndex) => {
                                            return (
                                                <tr key={`${pay}-${payIndex}`}>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {pay?.n_parcela}</td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {pay?.forma_pagamento}
                                                    </td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {formatter.format(pay?.valor_parcela)}</td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {formatTimeStamp(pay?.vencimento)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </ContentContainer>

                    </ContractStudentComponent>
                </div>
            </ContentContainer>

            <Box sx={{ display: 'flex', position: 'fixed', bottom: 30, right: 40 }}>
                <Button text="Gerar Contrato" style={{ borderRadius: 2 }} onClick={() => handleGenerateContract()} />
            </Box>
        </>
    )

}

export const styles = {
    containerValues: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        border: '1px solid lightgray',
        padding: '8px 15px',
        width: '100%',
        gap: 2
    },
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    },
}