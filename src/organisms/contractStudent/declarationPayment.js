import React, { useRef } from "react"
import { ContentContainer, Box, Text, Button } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { formatTimeStamp } from "../../helpers"

export const DeclarationPayment = (props) => {

    const { userData, children, title, paymentValue, contractEnrollment, filterDate } = props
    const { colorPalette, alert } = useAppContext()
    const contractService = useRef()

    const currentDate = new Date();
    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };
    const formattedDate = new Intl.DateTimeFormat("pt-BR", options).format(currentDate);


    return (

        <ContentContainer gap={6} style={{ boxShadow: 'none', backgroundColor: 'none', overflow: 'auto',}}>
            <div ref={contractService} style={{ padding: '20px 20px' }}>
                <Box sx={{ display: 'flex', gap: 6, flexDirection: 'column', backgroundColor: '#fff' }}>
                    <Text bold title>{title}</Text>

                    <ParagraphContainer>
                        <ParagraphBody
                            text={`Declaro, para os devidos fins, que ${userData?.nome},
                            CPF/CNPJ: ${userData?.cpf}, pagou o valor de ${paymentValue} para a Academia Melies de Ensino (AME),
                            CNPJ nº. 13.823.213/0001-65, no período de ${formatTimeStamp(filterDate?.firstDate)} a ${formatTimeStamp(filterDate?.endDate)}, referente parcelas do curso
                           ${contractEnrollment},`}
                        />
                    </ParagraphContainer>

                    <Box sx={{ flex: 1 }}>
                        {children}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '30px 0px 20px 0px', gap: 3 }}>
                        <Text>Sem mais.</Text>
                        <Text>São Paulo, {formattedDate}</Text>
                    </Box>
                </Box>
            </div>
        </ContentContainer >
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
        <>
            <Text bold={title ? true : false} title={title ? true : false}>{text}</Text>
        </>
    )

}

export const styles = {
    containerValues: {
        display: 'flex', flexDirection: 'row', flex: 1
    },
}