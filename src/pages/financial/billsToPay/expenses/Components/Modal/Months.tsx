import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Box, Button, ContentContainer, Divider, Text } from "../../../../../../atoms";
import { icons } from "../../../../../../organisms/layout/Colors";

interface MonthSelectProps {
    setShow: Dispatch<SetStateAction<boolean>>
    setMonthSelected: Dispatch<SetStateAction<string | null>>
    monthSelected: string | null
    show: boolean
}

const MonthsSelect: React.FC <MonthSelectProps> = ({ setShow, setMonthSelected, monthSelected, show }) => {
    const [monthReleaseSelected, setMonthReleaseSelected] = useState<string | null>(null)

    const groupMonths = [
        { label: 'Janeiro', value: '0' },
        { label: 'Fevereiro', value: '1' },
        { label: 'Março', value: '2' },
        { label: 'Abril', value: '3' },
        { label: 'Maio', value: '4' },
        { label: 'Junho', value: '5' },
        { label: 'Julho', value: '6' },
        { label: 'Agosto', value: '7' },
        { label: 'Setembro', value: '8' },
        { label: 'Outubro', value: '9' },
        { label: 'Novembro', value: '10' },
        { label: 'Dezembro', value: '11' }
    ]

    useEffect(() => {
        if (monthSelected) {
            setMonthReleaseSelected(monthSelected)
        }
    }, [show])

    const selectedMonths = (value: string) => {
        const alreadySelected = monthReleaseSelected === value;
        if (alreadySelected) {
            setMonthReleaseSelected(null);
        } else {
            setMonthReleaseSelected(value);
        }
    };

    return (
        <ContentContainer sx={{ zIndex: 9999 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                <Text bold large>Selecione o Mês de lançamento</Text>
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url(${icons.gray_close})`,
                    transition: '.3s',
                    zIndex: 99999,
                    "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} onClick={() => {
                    setShow(false)
                }} />
            </Box>
            <Divider distance={0} />
            <Box sx={{
                display: 'flex', gap: 1.75, alignItems: 'start',
                flexWrap: 'wrap',
                maxHeight: { xs: '200px', sm: '200px', md: '350px', lg: '400px', xl: '580px' },
                maxWidth: { xs: '200px', sm: '200px', md: '350px', lg: '400px', xl: '580px' },
            }}>
                {groupMonths?.map((item, index) => {
                    const selected = item?.value === monthReleaseSelected;
                    return (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{
                                    display: 'flex', gap: 1, width: 15, height: 15, border: '1px solid', borderRadius: '15px',
                                    backgroundColor: 'lightgray', alignItems: 'center', justifyContent: 'center',
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => selectedMonths(item?.value)}>
                                    {selected &&
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 17, height: 17,
                                            backgroundImage: `url('/icons/check_around_icon.png')`,
                                            transition: '.3s',
                                        }} />
                                    }
                                </Box>
                            </Box>
                            <Text>{item?.label}</Text>
                        </Box>
                    )
                })}
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Button text="Salvar" style={{ height: '30px', borderRadius: '6px' }}
                    onClick={() => {
                        setShow(false)
                        setMonthSelected(monthReleaseSelected)
                    }} />

                <Button cancel text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                    onClick={() => {
                        setShow(false)
                        setMonthReleaseSelected(null)
                    }} />
            </Box>
        </ContentContainer>
    )
}

const styles = {
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
}

export default MonthsSelect