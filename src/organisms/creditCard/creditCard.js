import { Box } from "../../atoms";
import { useAppContext } from "../../context/AppContext";
import Cards from 'react-credit-cards';
import React from 'react';



export const CreditCard = (props) => {
    const { data } = props
    const { setTheme, theme } = useAppContext();


    return (
        <Box>
            {/* <Cards
                cvc={data?.cvc}
                expiry={data?.dt_expiracao}
                // focused={data?.focus}
                name={data?.nome_cartao}
                number={data?.numero_cartao}
            /> */}
        </Box>
    )
}

const styles = {

}