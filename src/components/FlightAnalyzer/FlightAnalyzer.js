import { AutoComplete, Button, Card, DatePicker, Form, Image, Layout, Typography, message } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import './FlightAnalyzer.css';

const { Content } = Layout;
const { Title } = Typography;

const FlightAnalyzer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [aerodromos, setAerodromos] = useState([]);
  const [optionsOrigem, setOptionsOrigem] = useState([]);
  const [optionsDestino, setOptionsDestino] = useState([]);
  const [value, setValue] = useState('');
  const [selectedAerodromo, setSelectedAerodromo] = useState(null); // Para armazenar o valor real (SIGLA ICAO)


  useEffect(() => {
    // Carregar dados do backend
    axios.get('http://localhost:3001/aerodromos')
      .then((response) => {
        setAerodromos(response.data);
      })
      .catch((error) => {
        console.error('Erro ao carregar os aeródromos:', error);
      });
  }, []);

  const handleSearch = (value, setOptions) => {
    const filteredOptions = aerodromos
      .filter((aero) => aero['NOME AERÓDROMO'].toLowerCase().includes(value.toLowerCase()) ||
        aero['SIGLA ICAO AERÓDROMO'].toLowerCase().includes(value.toLowerCase()))
      .map((aero) => {
        console.log("aero", aero)
        return ({
          value: `${aero['NOME AERÓDROMO']} (${aero['SIGLA ICAO AERÓDROMO']})`,
          label: `${aero['NOME AERÓDROMO']} (${aero['SIGLA ICAO AERÓDROMO']})`
        })
      }
    
    );

    setOptions(filteredOptions);
  };

  const handleSelect = (value) => {
    // const selected = aerodromos.find(aero => aero['SIGLA ICAO AERÓDROMO'] === value);
    // if (selected) {
    //   setValue(`${selected['NOME AERÓDROMO']} (${selected['SIGLA ICAO AERÓDROMO']})`);
    //   setSelectedAerodromo(selected['SIGLA ICAO AERÓDROMO']);
    // }

    console.log(value)
  };

  // const handleChange = (newValue) => {
  //   setValue(newValue);
  // };

  const handleAnalyze = async (values) => {
    setLoading(true);
    setResult(null);

    try {
      // Preparar os dados para envio
      const { origem, destino, datetime } = values;
      const formattedDate = moment(datetime).format('YYYY-MM-DD HH:mm:ss');

      const payload = {
        origem,
        destino,
        datetime: formattedDate,
      };

      // Chamar as APIs
      const [companyResponse, predictionResponse] = await Promise.all([
        axios.post('http://localhost:3001/best-company', payload),
        axios.post('http://localhost:3001/predict', payload),
      ]);

      setResult({
        bestCompany: companyResponse.data,
        prediction: predictionResponse.data,
      });

      message.success('Análise concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao chamar as APIs:', error);
      message.error('Ocorreu um erro ao processar a análise.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="ant-layout">
      <Content className="container">
        <Card style={{ width: 500, margin: 'auto', textAlign: 'center' }}>
        <Image
          src="/images/logo v3.png"
          preview={false}
          alt="Logo"
          style={{ width: 400 }}
        />
          <Form form={form} onFinish={handleAnalyze} layout="vertical">
            <Form.Item
              label="Aeroporto de Origem"
              name="origem"
              rules={[{ required: true, message: 'Por favor, insira o aeroporto de origem!' }]}
            >
              <AutoComplete
                placeholder="Selecione o aeroporto de origem"
                // value={value}
                onSearch={(value) => handleSearch(value, setOptionsOrigem)}
                onSelect={handleSelect}
                // onChange={handleChange}
                options={optionsOrigem}
                style={{ width: '100%' }}
              />
              {/* Mostrar o valor da sigla ICAO (para fins de verificação) */}
              {selectedAerodromo && <p>Sigla ICAO Selecionada: {selectedAerodromo}</p>}
            </Form.Item>
            <Form.Item
              label="Aeroporto de Destino"
              name="destino"
              rules={[{ required: true, message: 'Por favor, insira o aeroporto de destino!' }]}
            >
              <AutoComplete
                placeholder="Selecione o aeroporto de destino"
                onSearch={(value) => handleSearch(value, setOptionsDestino)}
                // onSelect={handleSelect}
                options={optionsDestino}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              label="Data e Hora do Voo"
              name="datetime"
              rules={[{ required: true, message: 'Por favor, insira a data e hora do voo!' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Analisar Voo
              </Button>
            </Form.Item>
          </Form>

          {result && (
            <div>
              <Title level={4}>Resultado</Title>
              <p>
                <strong>Melhor Companhia Aérea:</strong> {result.bestCompany?.name || 'Desconhecida'}
              </p>
              <p>
                <strong>Probabilidade de Atraso:</strong> {result.prediction?.probabilidade_atraso || 0}%
              </p>
              <p>
                <strong>Tempo Estimado de Atraso:</strong> {result.prediction?.tempo_estimado_atraso || 0} minutos
              </p>
            </div>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default FlightAnalyzer;
