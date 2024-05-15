import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../../atoms"
import { CheckBoxComponent, PaginationTable, RadioItem, SectionHeader, Table_V1 } from "../../../../organisms"
import { useAppContext } from "../../../../context/AppContext"
import { createDiscipline, deleteDiscipline, editDiscipline } from "../../../../validators/api-requests"
import { SelectList } from "../../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../../helpers"
import { icons } from "../../../../organisms/layout/Colors"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"
import { PaymentDetailsBox, PaymentDetailsContainer, PaymentDetailsInfo, PaymentDetailsStatus, PaymentDetailsTitle } from "../../../../organisms/paymentDetails"
import Link from "next/link"

export default function EditBillsReceived(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, bill } = router.query;
    const [installmentData, setInstallmentData] = useState({})
    const [userData, setUserData] = useState({})
    const [installmentsStudent, setInstallmentsStudent] = useState([])
    const [usersList, setUsers] = useState([])
    const [costCenterList, setCostCenterList] = useState([])
    const [accountTypesList, setAccountTypesList] = useState([])
    const [menuUserData, setMenuUserData] = useState('userData')
    const themeApp = useTheme()


    const getInstallment = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/student/installment/${id}`);
            const { data } = response;
            if (data) {
                setInstallmentData(data);
                return data
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }


    const getUserData = async (userId) => {
        setLoading(true);
        try {
            const userResponse = await api.get(`/user/${userId}`);
            const { response } = userResponse?.data;
            if (response) {
                setUserData(response);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }


    const getOthersInstallments = async (enrollmentId) => {
        setLoading(true);
        try {
            const response = await api.get(`/student/installment/enrollment/${enrollmentId}`);
            const { data } = response;
            if (data?.length > 0) {
                setInstallmentsStudent(data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        handleItems();
    }, [id])

    const handleItems = async () => {
        setLoading(true)
        try {
            const installments = await getInstallment()
            if (installments?.matricula_id) {
                await getOthersInstallments(installments?.matricula_id)
                await getUserData(installments?.usuario_id)
            }
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Disciplina')
        } finally {
            setLoading(false)
        }
    }

    const checkRequiredFields = () => {
        // if (!received.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/received/delete/${id}`)
            if (response?.status == 200) {
                alert.success('Recebido excluído com sucesso.');
                router.push(`/financial/billsToReceive/billsReceived`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o recebimento.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/received/update/${id}`, { receivedData, userId: usuario_id })
                if (response?.status === 200) {
                    alert.success('Recebimento atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Recebimento.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Recebimento.');
            } finally {
                setLoading(false)
            }
        }
    }


    const groupStatus = [
        { label: 'Pago', value: 'Pago' },
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Cancelado', value: 'Cancelado' }
    ]

    const groupMenuUserData = [
        { text: 'Dados Pessoais', key: 'userData' },
        { text: 'Endereço', key: 'address' },
    ]


    const groupReadjustment = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const holidays = [
        new Date(2023, 0, 1),  // Ano Novo
        new Date(2023, 1, 25), // Carnaval
        new Date(2023, 1, 26), // Carnaval
        new Date(2023, 3, 7),  // Sexta-feira Santa
        new Date(2023, 3, 21), // Tiradentes
        new Date(2023, 4, 1),  // Dia do Trabalhador
        new Date(2023, 5, 15), // Corpus Christi
        new Date(2023, 8, 7),  // Independência do Brasil
        new Date(2023, 9, 12), // Nossa Senhora Aparecida
        new Date(2023, 10, 2), // Dia de Finados
        new Date(2023, 10, 15),// Proclamação da República
        new Date(2023, 11, 25)  // Natal
    ];



    return (
        <>
            <SectionHeader
                title={`Detalhes da Parcela`}
            >

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', }}>
                    <Link href={`/administrative/users/${installmentData?.usuario_id}/statusPayment?enrollmentId=${installmentData?.matricula_id}`} target="_blank">
                        <Button text="Nova Parcela" small style={{ borderRadius: 2, }}
                        />
                    </Link>
                    <Button text="Dar Baixa" small style={{ borderRadius: 2, }} />
                    <Button text="Excluir" secondary small style={{ borderRadius: 2, }} />
                </Box>

            </SectionHeader>


            <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 1.8 }}>
                    <PaymentDetailsContainer width="65%">
                        <PaymentDetailsTitle title="Informações" />
                        <PaymentDetailsBox>
                            <PaymentDetailsInfo header="ID BemPaggo" value={installmentData?.id_cobranca || '-'} />
                            <PaymentDetailsInfo header="Nº Parcela" value={installmentData?.n_parcela || '-'} />
                            <PaymentDetailsInfo header="Resp.pagante" value={installmentData?.pagante || '-'} />
                        </PaymentDetailsBox>
                        <PaymentDetailsBox>
                            <PaymentDetailsInfo header="Centro de Custo" value={installmentData?.nome_cc || '-'} />
                            <PaymentDetailsInfo header="Conta Bancária" value={installmentData?.nome_conta || '-'} />
                            <PaymentDetailsInfo header="Protestada" value={installmentData?.parc_protestada || '-'} />
                        </PaymentDetailsBox>
                    </PaymentDetailsContainer>

                    <PaymentDetailsContainer width="35%">
                        <PaymentDetailsTitle title="Detalhes da Cobrança" />
                        <PaymentDetailsBox justifyContent="flex-start" column={true} align="start">
                            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
                                <PaymentDetailsInfo flexDirection="row" align="center" header="Valor:" value={formatter.format(installmentData?.valor_parcela) || '-'} textLarge />
                                <PaymentDetailsStatus flexDirection="row" align="center" value={installmentData?.status_parcela || '-'} />
                            </Box>
                            <PaymentDetailsInfo flexDirection="row" align="center" header="ID Usuário:" value={installmentData?.usuario_id || '-'} />
                            <PaymentDetailsInfo gap={3} flexDirection="row" icon link={`/administrative/users/${installmentData?.usuario_id}`} location="/icons/user_avatar.png" value={installmentData?.aluno || '-'} />
                            <PaymentDetailsInfo gap={3} flexDirection="row" icon location="/icons/calendar_icon_home.png" value={formatTimeStamp(installmentData?.vencimento) || '-'} />
                            <PaymentDetailsInfo gap={3} flexDirection="row" icon
                                location={`/icons/${installmentData?.forma_pagamento === 'Boleto' ? 'barcode_icon' : 'creditCard_icon'}.png`}
                                value={installmentData?.forma_pagamento || '-'} />
                        </PaymentDetailsBox>
                    </PaymentDetailsContainer>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.8 }}>
                    <PaymentDetailsContainer width="60%">
                        <PaymentDetailsTitle title="Cobranças Recentes" />
                        <PaymentDetailsBox justifyContent="flex-start">
                            <TableOrders data={installmentsStudent} />
                        </PaymentDetailsBox>
                    </PaymentDetailsContainer>

                    <PaymentDetailsContainer width="40%">
                        <PaymentDetailsTitle title="Dados do Aluno" />
                        <PaymentDetailsBox column align="start">
                            <PaymentDetailsInfo header="Nome" value={userData?.nome || '-'} />
                            <PaymentDetailsInfo header="E-mail" value={userData?.email || '-'} />
                            <PaymentDetailsInfo header="Telefone" value={userData?.telefone || '-'} />
                        </PaymentDetailsBox>
                        <Divider distance={0} />
                        <Text bold style={{ color: 'gray', paddingLeft: 28 }}>Endereço:</Text>
                        <PaymentDetailsBox justifyContent="flex-start" gap={8}>
                            <PaymentDetailsInfo header="Rua" value={userData?.rua || '-'} />
                            <PaymentDetailsInfo header="Cidade" value={`${userData?.cidade}-${userData?.uf}` || '-'} />
                        </PaymentDetailsBox>
                        <PaymentDetailsBox justifyContent="flex-start" gap={8}>
                            <PaymentDetailsInfo header="Bairro" value={userData?.bairro || '-'} />
                            <PaymentDetailsInfo header="CEP" value={userData?.cep || '-'} />
                        </PaymentDetailsBox>
                    </PaymentDetailsContainer>
                </Box>

            </Box>
        </>
    )
}


const TableOrders = ({ data = [] }) => {

    const { setLoading, theme, colorPalette, user } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const router = useRouter()
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const priorityColor = (data) => (
        ((data === 'Pendente' || data === 'Em processamento') && 'yellow') ||
        ((data === 'Cancelada' || data === 'Cancelado' || data === 'Pagamento reprovado' || data === 'Não Autorizado' || data === 'Estornada') && 'red') ||
        (data === 'Pago' && 'green') ||
        (data === 'Aprovado' && 'blue') ||
        (data === 'Inativa' && '#f0f0f0') ||
        (data === 'Erro com o pagamento' && 'red') ||
        (data === 'Estornada' && '#f0f0f0'))


    return (
        <div style={{
            borderRadius: '8px', overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap',
            backgroundColor: colorPalette?.secondary,
            border: `1px solid ${theme ? '#eaeaea' : '#404040'}`
        }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                <thead>
                    <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Vencimento</Text></th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Aluno</Text></th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Tipo</Text></th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Valor</Text></th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Status</Text></th>
                    </tr>
                </thead>
                <tbody style={{ flex: 1, }}>
                    {data?.slice(startIndex, endIndex).map((item, index) => {
                        return (
                            <tr key={index} style={{
                                backgroundColor: colorPalette?.secondary,
                                opacity: 1,
                                transition: 'opacity 0.3s, background-color 0.3s',
                                cursor: 'pointer',
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = colorPalette?.primary + '77';
                                    e.currentTarget.style.opacity = '0.5';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = colorPalette?.secondary;
                                    e.currentTarget.style.opacity = '1';
                                }}
                                onClick={() => router.push(`/financial/billsToReceive/receipts/${item?.id_parcela_matr}`)}
                            >
                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light >
                                        {formatTimeStamp(item?.vencimento)}</Text>
                                    {/* <TextInput disabled={!isPermissionEdit && true} name='vencimento' onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)} value={(item?.vencimento)?.split('T')[0] || ''}  type="date" sx={{ padding: '0px 8px' }} /> */}
                                </td>

                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light >
                                        {item?.aluno || '-'}
                                    </Text>
                                </td>
                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light >{item?.forma_pagamento || '-'}</Text>
                                </td>
                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light >{formatter.format(item?.valor_parcela)}</Text>
                                </td>
                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            height: 25,
                                            backgroundColor: colorPalette.primary,
                                            gap: 1,
                                            alignItems: 'center',
                                            borderRadius: 2,
                                            justifyContent: 'start',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.status_parcela), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                        <Text small bold style={{ textAlign: 'center', padding: '0px 15px', }}>{item?.status_parcela || ''}</Text>
                                    </Box>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>

            <PaginationTable data={data}
                page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
            />

        </div>
    )
}




const styles = {
    containerRegister: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
        padding: '40px'
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}