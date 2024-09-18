import React, { useEffect, useState } from "react";
import { Box, Text, Divider, ButtonIcon } from "../../../atoms";
import { api } from "../../../api/api";
import { Backdrop, CircularProgress } from "@mui/material";
import HamalModal from "./component/hamalModal";
import TableHamal from "./component/tableHamal";
export interface Hamal {
  id: string;
  nome: string;
  seto: string;
  hamal: string;
}

export default function ListagemHamais() {
  const [hamaisList, setHamaisList] = useState<Hamal[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false)
  const [editHamal, setEditHamal] = useState<object>([])

  const fetchHamaisData = async () => {
    setLoadingData(true);
    try {
      const response = await api.get("/hamal");
      setHamaisList(response.data);
    } catch (error) {
      console.error("Erro ao buscar os hamais:", error);
    } finally {
      setLoadingData(false);
    }
  };
  const edit = async (hamal: any) => {
    
    await setEditHamal(hamal)
    await setShow(true)
    
  }
  const deleteHamal = async (hamalId: any) => {
    console.log('aqui')
    try {
      const response = await api.delete(`/hamal/delete/${hamalId}`);
      if (response.data.success) {
        await fetchHamaisData();

      }
    } catch (error) {
      console.error("Erro ao deletar o hamal:", error);
    }
  }
  const opemModal =async () => {
    await setEditHamal([])
    await setShow(true)
  }

  useEffect(() => {
    fetchHamaisData();
  }, []);

  return (
    <Box sx={styles.sectionContainer}>
      <Text title>Listagem de Hamais</Text>
      <Box sx={styles.containetButton}>
        <ButtonIcon
          text="Novo"
          icon={'/icons/wallet_add.png'}
          color="#fff"
          style={{ borderRadius: '12px 0px 0px 12px' }}
          onClick={() => opemModal()}
        />
      </Box>
      {show &&
        <Box sx={styles.containerModal}>
          <HamalModal setShow={() => setShow(false)} fetchHamaisData={fetchHamaisData} editHamal={editHamal}/>
        </Box>
      }

      <Divider />
      {loadingData ? (
        <Box sx={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      ) : hamaisList.length > 0 ? (
        <Box sx={styles.listContainer}>
          <TableHamal hamal={hamaisList} edit={edit} deleteHamal={deleteHamal} />
        </Box>
      ) : (
        <Box sx={styles.emptyContainer}>
          <Text bold>Nenhum hamal encontrado.</Text>
        </Box>
      )}




    </Box>
  );
}

const styles = {
  sectionContainer: {
    display: "flex",
    flexDirection: "column" as const,
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid lightgray",
    backgroundColor: "#f9f9f9",
    position: 'relative'
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  containerModal: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    left: "28%"
  },
  itemContainer: {
    padding: "10px",
    borderBottom: "1px solid lightgray",
  },
  emptyContainer: {
    padding: "20px",
    textAlign: "center" as const,
  },
  containetButton: {
    position: 'absolute',
    right: 20,
    width: 100,
    height: 100
  }
};
