import { useAppContext } from "../../context/AppContext";
import { Box, Button, Text } from "../../atoms";
import { formatTimeStamp } from "../../helpers";
import { icons } from "../layout/Colors";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Link from "next/link";

export const News = () => {
    const { setLoading, colorPalette, theme, user } = useAppContext()

    const newsData = [

        {
            imagem: '/background/seguranca_guia.jpg', area: 'Suporte', title: 'Guia de Boas Práticas de Segurança Digital.',
            date: '2024-10-24',
            link: 'https://academiamelies-my.sharepoint.com/:p:/r/personal/karine_martinez_melies_com_br/Documents/INFORMA%C3%87%C3%95ES%20IMPORTANTES/Manuais%20e%20Regras/Guias%20e%20Tutoriais%20T.I/Guia%20Basico%20Seguran%C3%A7a%20Digital.pptx?d=we1ff4938af084791809e8d916e7485e3&csf=1&web=1&e=IscKIK',
            new: true,
            description: 'Workchat fora do ar! O workchat está dora do ar temporáriamente, para realizar eventuais correções. Agradeçemos e pedirmos para que continue nos dando dê seu feedback através no chamado ou via Teams, para continuarmos melhorando!'
        },
        {
            imagem: '/background/chat-image.jpg', area: 'Suporte', title: 'WorkChat fora do ar temporáriamente!',
            date: '2024-09-19',
            new: false,
            description: 'Workchat fora do ar! O workchat está dora do ar temporáriamente, para realizar eventuais correções. Agradeçemos e pedirmos para que continue nos dando dê seu feedback através no chamado ou via Teams, para continuarmos melhorando!'
        },
        {
            imagem: '/background/aviso-4.jpg', area: 'Suporte', title: 'Atualizações Painel Administrativo',
            date: '2024-08-15', new: false,
            description: 'O Painel administrativo está passando por novas atualizações constantemente, para melhorar sua experiência.'
        },
        {
            imagem: '/background/aviso-7.jpeg', area: 'Suporte',
            new: false, title: 'Precisa de Ajuda?', date: '2024-08-05',
            description: 'Agora, para resolver qualquer questão, basta abrir um chamado no Portal do Aluno. O processo é simples: acesse o portal, clique em "Ajuda", selecione a categoria que melhor descreve sua necessidade, descreva o problema e envie o chamado. Nossa equipe cuidará disso com agilidade.'
        },
    ]

    return (
        <Box sx={{
            display: 'flex', gap: 2, width: { xs: '100%', xm: '100%', md: '100%', lg: 400, xl: 450 }, alignItems: 'center', backgroundColor: colorPalette.secondary, padding: '25px',
            boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`, borderRadius: 2, flexDirection: 'column',
            position: 'relative'
        }}>

            <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Text light veryLarge style={{ fontWeight: '550' }}>Avisos Importantes</Text>
                <Text light>Veja os últimos avisos e atualizações</Text>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center', }}>
                <Swiper
                    modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                    loop
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 10000, disableOnInteraction: false }}
                    style={{ width: '100%' }}
                >
                    {newsData.map((item, index) => (
                        <SwiperSlide key={index}>
                            <Box sx={{ display: 'flex', gap: 3, padding: '15px', flexDirection: 'column', width: '100%', position: 'relative' }}>
                                <Box sx={{
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    border: '1px solid lightgray', borderRadius: 6,
                                    width: '100%',
                                    height: 280,
                                    backgroundImage: `url(${item.imagem})`,
                                }} />

                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Text light style={{ color: 'gray' }} xsmall>{formatTimeStamp(item?.date)}</Text>
                                    <Box sx={{
                                        display: 'flex', gap: 2, padding: '8px 12px', borderRadius: 16, backgroundColor: colorPalette.primary,
                                        alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Text bold xsmall>{item?.area}</Text>
                                    </Box>

                                    {item.new && <Box sx={{ display: 'flex', zIndex: 999999999, padding: '5px 12px', borderRadius: 5, backgroundColor: colorPalette.buttonColor }}>
                                        <Text bold large style={{ color: '#fff' }}>Novo</Text>
                                    </Box>}
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', width: '100%' }}>
                                    <Text bold large>{item?.title}</Text>
                                    <Text light>{item?.description}</Text>
                                </Box>

                                {item?.link &&
                                    <Box sx={{ display: 'flex', padding: '5px', width: '100%', marginBottom: 2}}>
                                        <Link href={item?.link || ''} target="_blank" style={{ display: 'flex', width: '100%' }}>
                                            <Button text="Visualizar" style={{ width: '100%' }} />
                                        </Link>
                                    </Box>
                                }
                            </Box>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>
        </Box>
    );
};


const styles = {
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
        justifyContent: 'flex-start',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}