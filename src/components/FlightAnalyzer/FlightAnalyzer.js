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
  const [optionsOrigin, setOptionsOrigin] = useState([]);
  const [optionsDestination, setOptionsDestination] = useState([]);


  useEffect(() => {
    axios.get('http://localhost:3001/api/airports')
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
        return ({
          value: `${aero['SIGLA ICAO AERÓDROMO']}`,
          label: `${aero['NOME AERÓDROMO']} (${aero['SIGLA ICAO AERÓDROMO']})`
        })
      }
    );
    setOptions(filteredOptions);
  };

  const disableDates = (current) => {
    const today = moment().startOf('day');
    const maxDate = moment().add(5, 'days').endOf('day');
    return current && (current < today || current > maxDate);
  };

  const handleAnalyze = async (values) => {
    setLoading(true);
    setResult(null);

    console.log(values)

    try {
      const { origin, destination, datetime } = values;
      const dateObj = new Date(datetime);
      const payload = {
        origin,
        destination,
        datetime: dateObj.toLocaleString().replace(',', '')
      };

      const [flightAnalysisResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/analysis', { params: payload }),
      ]);

      setResult({
        flightAnalysis: flightAnalysisResponse.data,
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
              name="origin"
              rules={[{ required: true, message: 'Por favor, insira o aeroporto de origem!' }]}
            >
              <AutoComplete
                placeholder="Selecione o aeroporto de origem"
                onSearch={(value) => handleSearch(value, setOptionsOrigin)}
                options={optionsOrigin}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              label="Aeroporto de Destino"
              name="destination"
              rules={[{ required: true, message: 'Por favor, insira o aeroporto de destino!' }]}
            >
              <AutoComplete
                placeholder="Selecione o aeroporto de destino"
                onSearch={(value) => handleSearch(value, setOptionsDestination)}
                options={optionsDestination}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item
              label="Data e Hora do Voo"
              name="datetime"
              rules={[{ required: true, message: 'Por favor, insira a data e hora do voo!' }]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm:ss"
                valueFormat="YYYY-MM-DDTHH:mm:ssZ"
                style={{ width: '100%' }}
                disabledDate={disableDates}
              />
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
