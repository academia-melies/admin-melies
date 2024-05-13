import React, { useRef } from "react"
import { ContentContainer, Box, Text, Button } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { useReactToPrint } from "react-to-print"
import { formatDate, formatTimeStamp } from "../../helpers"

export const ContractStudentComponent = (props) => {

    const { userData, children, responsiblePayerData } = props
    const { colorPalette, alert } = useAppContext()
    const contractService = useRef()

    const handleGeneratePdf = useReactToPrint({
        content: () => contractService.current,
        documentTitle: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS',
        onAfterPrint: () => alert.info('Contrato gerado.')
    })

    const currentDate = new Date();
    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };
    const formattedDate = new Intl.DateTimeFormat("pt-BR", options).format(currentDate);


    const formatTimeDate = (date) => {
        if (date) {
            const formatDate = new Date(date);
            formatDate.setHours(formatDate.getHours() + 10);

            return formatDate
        }
        return null
    }


    return (

        <ContentContainer gap={6} style={{ boxShadow: 'none', backgroundColor: 'none', marginTop: 5, backgroundImage: 'https://adm-melies.s3.amazonaws.com/doc_melies_contrato_page-0001.jpg' }}>
            <div ref={contractService} style={{ padding: '0px 40px' }}>
                <Box sx={{ display: 'flex', gap: 6, marginTop: 5, flexDirection: 'column', backgroundColor: '#fff' }}>


                    <Text bold title>CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS</Text>
                    <Box>
                        <TextLine label="Nome completo:" data={userData?.nome} />
                        <Box sx={styles.containerValues}>
                            <TextLine label="Sexo:" data={userData?.genero} />
                            <TextLine label="Data do nascimento:" data={formatTimeStamp(formatTimeDate(userData?.nascimento))} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextLine label="RG:" data={userData?.rg} />
                            <TextLine label="CPF:" data={userData?.cpf} />
                            <TextLine label="Naturalidade:" data={userData?.naturalidade} />
                        </Box>
                        <TextLine label="Endereço:" data={userData?.rua} />
                        <Box sx={styles.containerValues}>
                            <TextLine label="Número:" data={userData?.numero} />
                            <TextLine label="Complemento:" data={userData?.complemento} />
                            <TextLine label="Bairro:" data={userData?.bairro} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextLine label="CEP:" data={userData?.cep} />
                            <TextLine label="Cidade:" data={userData?.cidade} />
                            <TextLine label="Estado:" data={userData?.uf} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextLine label="País:" data={userData?.pais_origem || 'Brasil'} />
                            <TextLine label="Ocupação:" data={''} />
                            <TextLine label="Empresa/Instituição:" data={''} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextLine label="Tel. residencial:" data={''} />
                            <TextLine label="Celular:" data={userData?.telefone} />
                        </Box>
                        <TextLine label="E-mail:" data={userData?.email} />
                        <Box sx={styles.containerValues}>
                            <TextLine label="Nome do pai:" data={userData?.nome_pai} />
                            <TextLine label="Nome da mãe:" data={userData?.nome_mae} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextLine label="Estado civil:" data={userData?.estado_civil} />
                            <TextLine label="Nome do conjuge:" data={userData?.conjuge} />
                        </Box>
                        <TextLine label="Em caso de emergência:" />
                        <Box sx={styles.containerValues}>
                            <TextLine label="Cel. emergência:" data={userData?.telefone_emergencia} />
                        </Box>
                        <Box sx={{ flex: 1, marginTop: 5 }}>
                            <Box sx={{ backgroundColor: colorPalette.buttonColor, flex: 1 }}>
                                <TextLine label="Dados do(a) Responsável / Empresa / Pagante" style={{ title: { color: '#fff' } }} />
                            </Box>
                            <Box sx={styles.containerValues}>
                                <TextLine label="Empresa/Nome do Resp:" data={responsiblePayerData.nome_resp || userData?.nome} />
                                <TextLine label="Endereço:" data={responsiblePayerData.end_resp || userData?.rua} />
                            </Box>
                            <Box sx={styles.containerValues}>
                                <TextLine label="Número:" data={responsiblePayerData.numero_resp || userData?.numero} />
                                <TextLine label="CEP:" data={responsiblePayerData.cep_resp || userData?.cep} />
                                <TextLine label="Complemento:" data={responsiblePayerData.compl_resp || userData?.complemento} />
                            </Box>
                            <Box sx={styles.containerValues}>
                                <TextLine label="Bairro:" data={responsiblePayerData.bairro_resp || userData?.bairro} />
                                <TextLine label="Cidade:" data={responsiblePayerData.cidade_resp || userData?.cidade} />
                                <TextLine label="Estado:" data={responsiblePayerData.estado_resp || userData?.uf} />
                                <TextLine label="País:" data={responsiblePayerData.pais_resp || userData?.pais_origem || 'Brasil'} />
                            </Box>
                            <TextLine label="E-mail:" data={responsiblePayerData.email_resp || userData?.email} />
                            <Box sx={styles.containerValues}>
                                <TextLine label="Telefone:" data={responsiblePayerData.telefone_resp || userData?.telefone} />
                                <TextLine label="CPF / CNPJ:" data={responsiblePayerData.cpf_resp || userData?.cpf} />
                                <TextLine label="RG:" data={responsiblePayerData.rg_resp || userData?.rg} />
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        {children}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '30px 0px 20px 0px', gap: 6 }}>

                        <ParagraphContainer>
                            <ParagraphBody
                                text='Pelo presente INSTRUMENTO PARTICULAR DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS, que entre si fazem, de um lado a ACADEMIA MELIES DE ENSINO,
                pessoa jurídica de direito privado, inscrita no CNPJ sob n° 13.823.213/0001-65, com sede na Avenida Ibirapuera, 2657, Cep: 04029-200, Bairro de Indianópolis,
                na cidade de são Paulo, são Paulo, entidade Mantenedora da FACULDADE MÉLIÈS e doravante denominada de CONTRATADA, e de outro lado o(a) aluno(a),
                ou seu representante legal, doravante denominado CONTRATANTE , tendo o objeto a prestação de serviços educacionais,
                resolvem firmar o presente contrato nos seguintes termos:'
                            />
                        </ParagraphContainer>

                        <ParagraphContainer>
                            <ParagraphBody title text="1 - DA PRESTAÇÃO DE SERVIÇOS" />
                            <ParagraphBody text="1.1 - A CONTRATADA prestará ao CONTRATANTE, serviços educacionais escolhidos por ele no ato do cadastro" />
                            <ParagraphBody text="1.2 - A CONTRATADA se obriga a ministrar aulas e atividades escolares na modalidade de Ensino a Distância (EaD) ou
                     no sistema ON-live (aulas ministradas ao vivo de forma online), sendo-lhe reservado o direito de indicar quais as ferramentas ou localidades onde serão ministradas as aulas,
                      tendo em vista a natureza do conteúdo e da técnica pedagógica que se fizer necessária,
                     ou na modalidade presencial, sendo que, neste caso, as aulas serão ministradas na sede da CONTRATADA, nos horários e dias especificados pelo Contratante" />
                        </ParagraphContainer>

                        <ParagraphContainer>
                            <ParagraphBody title text="2 - DO PAGAMENTO E DO REAJUSTE" />
                            <ParagraphBody text="2.1 Como contrapartida pelos serviços que serão prestados pela CONTRATADA, o CONTRATANTE pagará o valor total do curso, da maneira que foi por ele escolhida no ato da contratação dos serviços." />
                            <ParagraphBody text="2.2 As mensalidades serão reajustadas a cada 12 meses, a contar da data da contratação dos serviços, e o índice a ser utilizado será o IGPM/FGV acumulado no período" />
                            <ParagraphBody text="2.3 No caso de pagamento ESTENDIDO (mês a mês), as parcelas não se acumulam, contudo, nos casos de trancamento de matrícula; desistência, transferência, cancelamento do curso ora contratado ou inadimplência, será calculado o valor proporcional a ser pago pelo CONTRATANTE." />
                        </ParagraphContainer>


                        <ParagraphContainer>
                            <ParagraphBody title text="3 - DA INADIMPLÊNCIA" />
                            <ParagraphBody text="3.1 - Em caso de inadimplência, ao valor residual será acrescido multa de 2%, juros de 1% A.M., correção monetária pelo INPC até o efetivo pagamento do débito." />
                            <ParagraphBody text="3.2 - A CONTRATADA poderá incluir o nome do devedor nos ORGÃOS DE PROTEÇÂO AO CRÉDITO, bem como no Cartório de Protestos." />
                            <ParagraphBody text="3.3 - Somente será válida a suspensão ou interrupção do pagamento, informada a  CONTRATADA por escrito com antecedência de 30 dias do vencimento da parcela vincenda." />
                        </ParagraphContainer>

                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '30px 0px 20px 0px', gap: 6 }}>

                        <ParagraphContainer>
                            <ParagraphBody title text="4 - DA MATRÍCULA E REMATRICULAS" />
                            <ParagraphBody text="4.1 - As matrículas serão aceitas com a assinatura do presente Instrumento e também no quadro resumo, contudo, é obrigatória a entrega dos documentos e recebimento da primeira parcela do pagamento para efetivação da mesma." />
                            <ParagraphBody text="4.2 - As rematrìculas (em caso de graduação) serão realizadas automaticamente, ao final de cada semestre, até a conclusão do curso contratado, e para serem efetivadas o CONTRATANTE deverá efetuar o pagamento da primeira parcela do período subsequente." />
                            <ParagraphBody text="4.3 - O CONTRATANTE declara estar ciente de que efetivado o pagamento da PARCELA descrita na cláusula 4.2, estará ratificando a sua adesão e aceitação aos termos ora CONTRATADOS, estando o presente instrumento efetivamente prorrogado até o final do período letivo correspondente a renovação, desde que o CONTRATANTE esteja adimplente com suas obrigações financeiras quando do início do período letivo que se pretende contratar. Ressaltam as partes, independentemente do pagamento estabelecido na cláusula 4.2, a renovação de matrícula somente será considerada válida e efetivada caso o CONTRATANTE esteja academicamente apto, aprovado e adimplente com suas obrigações financeiras Contratadas pelo presente instrumento quando do início do período letivo que se pretende contratar" />
                            <ParagraphBody text="4.4 - Caso o Aluno/ CONTRATANTE não seja aprovado, a rematrícula será feita automaticamente para cursar o mesmo semestre, e no caso de o Aluno/ CONTRATANTE ter ficado em Dependência em alguma disciplina, a rematrícula para o semestre seguinte, será feita juntamente com a matrícula para a disciplina em que está Dependente." />
                            <ParagraphBody text="4.5 - As Cobranças das disciplinas de Dependência serão calculadas proporcionalmente aos valores das mensalidades." />
                        </ParagraphContainer>

                        <ParagraphContainer>
                            <ParagraphBody title text="5 - DAS RESPONSABILIDADES" />
                            <ParagraphBody text="5.1 - Da Contratada" />
                            <ParagraphBody text="5.1.1 - A Contratada deverá possuir tecnologia de Hardware, Software e Internet, que sejam compatíveis com os cursos ministrados, sejam eles por meio de EaD, OnLine ao vivo ou presenciais, no caso dos cursos presenciais, deverá ainda possuir ambientes que sejam propícios para que as aulas sejam adequadamente ministradas." />
                            <ParagraphBody text="5.1.2 - A Contratada deverá contar em seu corpo docente professores qualificados para cada disciplina oferecida em seus cursos" />
                            <ParagraphBody text="5.2 - Do Contratante" />
                            <ParagraphBody text="5.2.1 - O CONTRATANTE se compromete e deverá possuir hardware, software e internet que lhe permitam frequentar aulas do EaD ou ON-live, sendo que, a CONTRATADA não se responsabiliza no caso de incompatibilidade ou déficit de equipamento do CONTRATANTE." />
                            <ParagraphBody text="5.2.2 - O CONTRATANTE deverá ser assíduo, comparecendo a todas as atividades que serão previamente agendadas para o curso escolhido, e das quais serão encaminhados periodicamente e, previamente, informativos e calendários, caso não possua assiduidade, poderá ser reprovado." />
                            <ParagraphBody text="5.2.3 - O CONTRATANTE deverá arcar com suas responsabilidades financeiras pontualmente." />
                        </ParagraphContainer>

                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '30px 0px 20px 0px', gap: 6 }}>
                        <ParagraphContainer>
                            <ParagraphBody title text="6 - DO CANCELAMENTO OU TRANCAMENTO DA MATRÍCULA/ DESISTÊNCIA DO CURSO" />
                            <ParagraphBody text="6.1 - Em caso de desistência do curso ou trancamento da matrícula no decorrer do perído letivo, serão devidas mensalidades até a data da formalização do trancamento ou desistência, a formalização deve ser realizada por escrito e protocolada na secretaria da CONTRATANTE." />
                            <ParagraphBody text="6.2 - No caso de o CONTRATANTE ter optado pelo pagamento parcelado, a última parcela a ser paga é a devida referente ao mês da desistência ou trancamento da matrícula (mesmo que as parcelas estejam em atraso ou a vencer), caso o curso tenha sido pago a vista, a devolução será calculada até o mês do pedido da desistência ou trancamento da matrícula. (Lembrando que o semestre se divide da seguinte forma: janeiro a junho e julho a dezembro)." />
                            <ParagraphBody text="6.3 - Em caso de cancelamento de matrícula, a CONTRATADA restituirá 80% do valor pago a título de matrícula (1/6 da semestralidade), desde que o cancelamento seja efetuado antes do início do curso." />
                            <ParagraphBody text="6.4 - Em quaisquer dos casos a devolução dos valores se dará em até 10 dias úteis contados da efetivação do pedido" />
                        </ParagraphContainer>


                        <ParagraphContainer>
                            <ParagraphBody title text="7 - DA POLÍTICA DE PRIVACIDADE" />
                            <ParagraphBody text="7.1 - O CONTRATANTE autoriza o repasse dos seus dados pessoais ao INEP - Instituto Nacional de Estudos e Pesquisas Educacionais, que utiliza tais dados para fins estatísticos." />
                            <ParagraphBody text="7.2 - O CONTRATANTE autoriza o repasse dos seus dados cadastrais e acadêmicos a  USP - Universidade de são Paulo, ao término do curso, para fins de registro do diploma." />
                            <ParagraphBody text="7.3 - O CONTRATANTE se compromete a não ceder, emprestar ou repassar o login e senha de acesso e/ou conteúdo do curso a terceiros, sob pena de incorrer nas penalidades cíveis e criminais da legislação vigente." />
                            <ParagraphBody text="7.4 - É vedado ao Aluno/ Contratante reproduzir, divulgar, vender, ceder, emprestar transmitir quaisquer informações, material didático ou paradidático a terceiros sem o prévio consentimento da Contratada, sob pena de responder judicialmente por tais práticas." />
                            <ParagraphBody text="7.5 - O CONTRATANTE autoriza de forma expressa e não onerosa, a fazer uso da imagem do aluno para qualquer fim legalmente previsto, como: ações comerciais, de marketing, promocionais, etc." />
                        </ParagraphContainer>
                    </Box>
                    <ParagraphContainer>
                        <ParagraphBody title text="8 - DISPOSIÇÕES FINAIS" />
                        <ParagraphBody text="8.1 - As Partes convencionam que o presente Instrumento só entrará em vigor após o preenchimento das vagas suficientes para a formação da turma do curso contratado. Caso não seja efetivado número suficiente de matriculados para o curso contratado, poderá o CONTRATANTE optar por cursar outro curso, ou cancelar definitivamente sua matrícula" />
                        <ParagraphBody text="8.2 - As partes aceitam os termos do presente Instrumento em sua integralidade e, reconhecem que o mesmo tem força executiva extrajudicial." />
                        <ParagraphBody text="8.3 - As Partes elegem o foro regional de Santo Amaro na comarca da capital do estado de são Paulo, com expressa renúncia a qualquer outro, para dirimir todas e quaisquer questões oriundas do presente Instrumento." />
                    </ParagraphContainer>

                    <Text>São Paulo, {formattedDate}</Text>
                </Box>
            </div>
        </ContentContainer >
    )
}

export const TextLine = ({ label = '', data, row = false, style = {} }) => {

    return (
        // <Box sx={{ display: 'flex', flexDirection: row ? 'row' : 'column', gap: 0.6, }}>
        <Box sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            border: '1px solid lightgray',
            padding: '8px 15px',
            width: '100%',
            gap: 1
        }}>
            <Text bold small style={{ ...style.title }}>{label}</Text>
            <Text small style={{ ...style.data }}>{data}</Text>
        </Box>
    )

}

export const ParagraphContainer = ({ children, gap = 0 }) => {

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: gap, }}>
            {children}
        </Box>
    )

}

export const ParagraphBody = ({ title = false, text }) => {

    return (
        <div style={{ whiteSpace: 'pre-wrap' }}>
        <Text bold={title ? true : false} title={title ? true : false} style={{
        }}>{text}</Text>
    </div>
    )

}

export const styles = {
    containerValues: {
        display: 'flex', flexDirection: 'row', flex: 1
    },
}