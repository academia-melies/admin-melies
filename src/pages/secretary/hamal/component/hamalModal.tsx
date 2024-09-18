import { ChangeEvent, Dispatch, SetStateAction, useState,useEffect } from "react";
import { Box, Button, ContentContainer, Divider, Text } from "../../../../atoms";
import { TextInput } from "../../../../atoms";
import { CircularProgress } from "@mui/material";
import { api } from "../../../../api/api";
import { useAppContext } from "../../../../context/AppContext";

interface HamalFormProps {
    setShow: Dispatch<SetStateAction<boolean>>;
    fetchHamaisData: any;
    editHamal: any;
    
}

interface HamalData {
    seto: string;
    hamal: string;
    nome: string;
    usuario_resp: any;
}

const HamalModal = ({ setShow, fetchHamaisData, editHamal }: HamalFormProps) => {
    const [hamalData, setHamalData] = useState<HamalData>({
        seto: '',
        hamal: '',
        nome: '',
        usuario_resp: 0
    });  

    const [loading, setLoading] = useState<boolean>(false);
    const { alert,user } = useAppContext(); 

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setHamalData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    useEffect(() => {      
        if (editHamal) {
            setHamalData(editHamal);
        } else {          
            setHamalData({
                seto: '',
                hamal: '',
                nome: '',
                usuario_resp: 0,
            });
        }
     }, [editHamal]);
    const handleEdit = async () =>{
        try {
            setLoading(true);
            hamalData.usuario_resp = user.id
            const response = await api.post(`/hamal/update/${editHamal.id}`, {hamal: hamalData}); 
            
            if (response.data.success) {
                alert.success('Hamal editado com sucesso!');
                setShow(false);
                setHamalData({
                    seto: '',
                    hamal: '',
                    nome: '',
                    usuario_resp: 0,
                });
                await fetchHamaisData()
            } else {
                alert.error('Erro ao editar o Hamal.');
            }
        } catch (error) {
            console.error(error);
            alert.error('Erro no servidor.');
        } finally {
            setLoading(false);
        }
    }

    const handleCreate = async () => {
       
        try {
            setLoading(true);
            hamalData.usuario_resp = user.id
            const response = await api.post('/hamal/create', {hamal: hamalData}); 
            
            if (response.data.success) {
                alert.success('Hamal criado com sucesso!');
                setShow(false);
                setHamalData({
                    seto: '',
                    hamal: '',
                    nome: '',
                    usuario_resp: 0,
                });
                await fetchHamaisData()
            } else {
                alert.error('Erro ao criar o Hamal.');
            }
        } catch (error) {
            console.error(error);
            alert.error('Erro no servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ContentContainer sx={{ zIndex: 9999,width: 1000 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text bold large>Novo Hamal</Text>
                <Box sx={{
                     backgroundSize: 'contain',
                     backgroundRepeat: 'no-repeat',
                     backgroundPosition: 'center',
                     width: 20,
                     height: 20,
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
            <Divider />

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            )}

            <Box sx={{ display: loading ? 'none' : 'block', padding: 5 }}>
                <TextInput                    
                    placeholder="Setor"
                    name="seto"
                    value={hamalData.seto}
                    onChange={handleChange}
                    label="Setor:"
                />
                <TextInput
                    sx={{ marginLeft: 5 }}
                    placeholder="Hamal"
                    name="hamal"
                    value={hamalData.hamal}
                    onChange={handleChange}
                    label="Hamal:"
                />
                <TextInput
                    sx={{ marginLeft: 5 }}
                    placeholder="Nome"
                    name="nome"
                    value={hamalData.nome}
                    onChange={handleChange}
                    label="Nome:"
                />
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button text="Salvar" onClick={editHamal.length !== 0 ? handleEdit : handleCreate} disabled={loading} />
                <Button text="Cancelar" onClick={() => setShow(false)} />
            </Box>
        </ContentContainer>
    );
};

export default HamalModal;
export const icons = { 
    gray_close: 'https://mf-planejados.s3.amazonaws.com/gray_close.png',
 }
