import { ClockCircleOutlined, PieChartOutlined } from '@ant-design/icons';

import { AutoComplete, Button, Card, Col, DatePicker, Divider, Form, Image, Layout, Row, Statistic, Typography, message } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import './FlightAnalyzer.css';

import FlightAnalyzerService from '../../services/FlightAnalyzerService';

const { Content } = Layout;
const { Title } = Typography;

const FlightAnalyzer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [aerodromos, setAerodromos] = useState([]);
  const [optionsOrigin, setOptionsOrigin] = useState([]);
  const [optionsDestination, setOptionsDestination] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    FlightAnalyzerService.getAirports()
      .then((response) => {
        setAerodromos(response);
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

  function convertMinutesToHoursAndMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    if(hours === 0){
      return `${remainingMinutes}m`;
    }else{
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  const handleAnalyze = async (values) => {
    setLoading(true);
    try {
      const { origin, destination, datetime } = values;
      const dateObj = new Date(datetime);
      const payload = {
        origin,
        destination,
        datetime: dateObj.toLocaleString().replace(',', '')
      };

      const [flightAnalysisResponse] = await Promise.all([
        FlightAnalyzerService.analyzeFlight(payload)
      ]);

      setAnalysisResult(flightAnalysisResponse.data)

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
        <Card style={{ margin: 'auto', textAlign: 'center' }}>
        <Row justify="center">
          <Col span={analysisResult ? 10 : 24}>
            <Image
              src="/images/logo.png"
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
                <Button style={{ backgroundColor: '#2074b7' }} type="primary" htmlType="submit" loading={loading} block>
                  Analisar Voo
                </Button>
              </Form.Item>
            </Form>
          </Col>

          {analysisResult && (
            <Col span={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0px 50px 0px 50px' }}>
              <Divider type="vertical" style={{ height: '80%' }}/>
            </Col>
          )}

          {analysisResult && (
            <Col span={10} style={{ height: '100%', marginTop: 'auto', marginBottom: 'auto' }}>
              <Title level={2} style={{ color: '#2074b7' }}>Resultado da Análise</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Card style={{ height: '100%' }}>
                    <Title level={5} style={{ color: '#2074b7' }}>Melhor Companhia Aérea</Title>
                    <p style={{ color: '#2074b7'}}>{analysisResult?.air_company || 'Desconhecida'}</p>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card style={{ height: '100%' }}>
                    <Title level={5} style={{ color: '#2074b7' }}>Probabilidade de Atraso</Title>
                    <Statistic
                      title="%"
                      value={analysisResult?.probability_of_outcome}
                      precision={2}
                      valueStyle={{ color: analysisResult?.probability_of_outcome > 50 ? 'red' : 'green' }}
                      prefix={<PieChartOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: '20px' }}>
                <Col span={12}>
                  <Card style={{ height: '100%' }}>
                    <Title level={5} style={{ color: '#2074b7' }}>Tempo Estimado de Voo</Title>
                    <Statistic
                      title="Horas/Minutos"
                      value={convertMinutesToHoursAndMinutes(analysisResult?.estimated_flight_time)}
                      precision={2}
                      valueStyle={{ color: analysisResult?.estimated_flight_time > analysisResult?.normal_flight_time ? 'red' : 'green' }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>

                <Col span={12}>
                <Card style={{ height: '100%' }}>
                    <Title level={5} style={{ color: '#2074b7' }}>Tempo Mediano de Voo</Title>
                    <Statistic
                      title="Horas/Minutos"
                      value={convertMinutesToHoursAndMinutes(analysisResult?.normal_flight_time)}
                      precision={2}
                      valueStyle={{ color: '#2074b7'}}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>
            </Col>
          )}
        </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default FlightAnalyzer;
