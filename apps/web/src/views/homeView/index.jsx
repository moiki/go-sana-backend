import {Card, Col, Row, Typography, List, Empty, Skeleton} from "antd";
import {DollarOutlined, ShoppingOutlined, FileTextOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import utilsServices, {PARSE_TEXT} from "../../services/utils.services";
import {useDashboardQuery} from "../../services/query/api";
import SalesPanel from "./SalesPanel";

function Home() {
    const {Title, Text, Paragraph} = Typography;
    const {data: dashboard, isLoading: dashboardLoading} = useDashboardQuery();

    const todayTotal = dashboard?.today_total ?? 0;
    const todayTickets = dashboard?.today_tickets ?? 0;
    const latestSales = dashboard?.latest_sales ?? [];

    const kpis = [
        {
            key: "today_total",
            label: "Ventas del día",
            value: utilsServices.ParseNumber(todayTotal, PARSE_TEXT.MONEY),
            icon: <DollarOutlined/>,
        },
        {
            key: "today_tickets",
            label: "Tickets del día",
            value: String(todayTickets),
            icon: <ShoppingOutlined/>,
        },
    ];

    return (<>
        <div className="layout-content">
            <Row className="rowgap-vbox" gutter={[24, 0]}>
                {kpis.map((kpi) => (
                    <Col
                        key={kpi.key}
                        xs={24}
                        sm={24}
                        md={12}
                        lg={6}
                        xl={6}
                        className="mb-24"
                    >
                        <Card bordered={false} className="criclebox">
                            <div className="number">
                                <Row align="middle" gutter={[24, 0]}>
                                    <Col xs={18}>
                                        <span>{kpi.label}</span>
                                        <Title level={3}>
                                            {kpi.value}
                                        </Title>
                                    </Col>
                                    <Col xs={6}>
                                        <div className="icon-box">{kpi.icon}</div>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={24} md={12} lg={12} xl={10} className="mb-24">
                    <Card bordered={false} className="criclebox h-full">
                        <div className="timeline-box">
                            <Title level={5}>Últimas ventas</Title>
                            <Paragraph className="lastweek" style={{marginBottom: 24}}>
                                {dayjs().format("dddd DD MMMM YYYY")}
                            </Paragraph>
                            {dashboardLoading ? (
                                <Skeleton active/>
                            ) : latestSales.length === 0 ? (
                                <Empty description="Aún no hay ventas hoy"/>
                            ) : (
                                <List
                                    itemLayout="horizontal"
                                    dataSource={latestSales}
                                    renderItem={(sale) => {
                                        const amount = utilsServices.ParseNumber(sale.amount ?? 0, PARSE_TEXT.MONEY);
                                        return (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<div className="icon-box"><FileTextOutlined/></div>}
                                                    title={<b>Factura {sale.invoice_number ?? ""} — {sale.client_name ?? "Cliente"} </b>}
                                                    description={dayjs(sale.createdAt).format("ddd DD MMM h:mm a")}
                                                />
                                                <div>
                                                    <Text strong>{amount}</Text>
                                                </div>
                                            </List.Item>
                                        );
                                    }}
                                />
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12} xl={14} className="mb-24">
                    <SalesPanel/>
                </Col>
            </Row>
        </div>
    </>);
}

export default Home;