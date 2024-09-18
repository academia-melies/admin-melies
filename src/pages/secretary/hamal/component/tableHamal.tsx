import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CircularProgress
} from "@mui/material";
import { Text } from "../../../../atoms"; // Supondo que este seja o componente de texto importado
import { api } from "../../../../api/api";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export interface Hama {
  id: string;
  nome: string;
  setor: string;
  hamal: string;
}
interface HamalProps {
    hamal: any;
    edit: any;
    deleteHamal: any;
    
}

export default function TableHamal({hamal, edit,deleteHamal}:HamalProps) {
  const [hamaisList, setHamaisList] = useState<Hama[]>(hamal);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  

  useEffect(() => {
  
  }, []);

  const columns = [   
    { label: "Nome" },
    { label: "Setor" },
    { label: "Ramal" },
    { label: "Açoes" },
  ];

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer sx={{ borderRadius: '8px', overflow: 'auto' }}>
      <Table sx={{ borderCollapse: 'collapse', width: '100%' }}>
        <TableHead>
          <TableRow sx={{ borderBottom: `2px solid #fff` }}>
            {columns.map((column, index) => (
              <TableCell key={index} sx={{ padding: '16px' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text bold style={{ textAlign: 'center' }}>{column.label}</Text>
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ flex: 1, padding: 5, backgroundColor: '#fff'}}>
          {
            hamaisList.length > 0 ? (
              hamaisList.map((hamal, index) => (
                <TableRow key={`${hamal.id}-${index}`} sx={{
                  "&:hover": {
                    cursor: 'pointer',
                    backgroundColor: '#fff' + '88'
                  },
                }} >                
                  <TableCell sx={{
                    padding: '8px 10px', textAlign: 'center',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '160px',
                  }} onClick={()=> edit(hamal)}>
                    <Text>{hamal.nome || '-'}</Text>
                  </TableCell>
                  <TableCell sx={{
                    padding: '8px 10px', textAlign: 'center',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '160px',
                  }} onClick={()=> edit(hamal)}>
                    <Text>{hamal.setor || '-'}</Text>
                  </TableCell>
                  <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }} onClick={()=> edit(hamal)}>
                    <Text>{hamal.hamal || '-'}</Text>
                  </TableCell>
                  <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                    <Text sx={{ display:'flex',alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <Box sx={{ marginRight: 3 }} onClick={()=> edit(hamal)}><EditIcon /> </Box>
                      <Box onClick={()=> deleteHamal(hamal.id)}><DeleteIcon /> </Box>

                    </Text>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', padding: '20px' }}>
                  <Text bold>Nenhum hamal encontrado.</Text>
                </TableCell>
              </TableRow>
            )
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
