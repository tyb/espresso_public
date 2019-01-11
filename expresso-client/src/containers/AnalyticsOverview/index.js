import React, { Component } from 'react';
import {
  Spin,
  Rate,
  Progress,
  Row,
  Col,
  Input,
  Button,
  Cascader,
  Pagination,
  message,
} from 'antd';
import { getBrand, getComments } from '../../graphql-client/api';
import Wrapper from '../../hoc/Wrapper';
import { optionsDomain, optionsSort, optionsStar } from '../../constant';
import CustomerCmt from '../../components/Comment';

const Search = Input.Search;

class AnalyticsOverview extends Component {
  state = {
    loading: true,
    loadingCmt: true,
    data: {},
    starPercent: [],
    optionsDomain: ['ALL'],
    optionsSort: ['DESC'],
    optionsStar: ['0'],
    dataCmts: [],
    keyword: '',
    page: 1,
  };

  componentDidMount() {
    this.getBrandSummary();
    this.getCustomerComments();
  }

  getBrandSummary = async (name, domain) => {
    const res = await getBrand(
      this.props.match.params.name,
      this.state.optionsDomain[0],
    );

    if (res.networkStatus === 7) {
      await this.setState({
        loading: false,
        data: res.data.getBrand,
      });

      let starPercent = [];
      this.state.data.rate.rateCount.forEach((element) => {
        starPercent.push(
          Number(
            ((element.totalCmt / this.state.data.totalCmt) * 100).toFixed(2),
          ),
        );
      });

      starPercent.push(5, 4, 3, 2, 1);

      this.setState({
        starPercent,
      });
    } else {
      message.error('Không tìm thấy thương hiệu');
      this.props.history.goBack();
    }
  };

  getCustomerComments = async (keyword = this.state.keyword) => {
    await this.setState({
      keyword,
    });

    const cmts = await getComments({
      offset: (this.state.page - 1) * 10,
      brand: this.props.match.params.name,
      star: this.state.optionsStar[0],
      domain: this.state.optionsDomain[0],
      sort: this.state.optionsSort[0],
      keyword: this.state.keyword,
    });

    if (cmts.networkStatus === 7) {
      this.setState({
        loadingCmt: false,
        dataCmts: cmts.data.getComments,
      });
    } else {
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  _onChangeSort = async (value) => {
    await this.setState({
      optionsSort: value,
      page: 1,
    });

    this.getCustomerComments();
  };

  _onChangeDomain = async (value) => {
    await this.setState({
      optionsDomain: value,
      page: 1,
    });
    this.getBrandSummary();
    this.getCustomerComments();
  };

  _onChangeStar = async (value) => {
    await this.setState({
      optionsStar: value,
      page: 1,
    });

    this.getCustomerComments();
  };

  _onClickStar = async (star) => {
    await this.setState({
      optionsStar: [`${star}`],
      page: 1,
    });

    this.getCustomerComments();
  };

  _onSearch = async (value) => {
    await this.setState({
      page: 1,
    });
    this.getCustomerComments(value);
  };

  _onChangePage = async (page) => {
    await this.setState({
      page,
    });

    this.getCustomerComments();
  };

  render() {
    return (
      <Wrapper brand={this.props.match.params.name}>
        <Row style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: '20px 0px 0px 50px' }}>
            Kết quả phân tích liên quan đến từ khoá:{' '}
            <p style={{ color: 'red', fontWeight: '500', display: 'inline' }}>
              {this.props.match.params.name}
            </p>{' '}
          </h2>
        </Row>
        <Row style={{ width: '100%' }}>
          <Col span={1} />
          <Col span={4}>
            {this.state.loading ? (
              <Spin style={{ margin: '0px 0px 0px 50%' }} size="large" />
            ) : (
              <div>
                <h2>Bình luận của khách hàng</h2>
                <span>
                  <Rate
                    disabled
                    defaultValue={Number(this.state.data.rate.average)}
                    allowHalf={true}
                  />
                  <span className="ant-rate-text">
                    <h2>{this.state.data.totalCmt}</h2>
                  </span>
                </span>
                <p>{this.state.data.rate.average.toFixed(2)} out of 5 stars</p>
                {this.state.starPercent.map((item, index) => {
                  if (index >= 5) return null;
                  return (
                    <Button
                      onClick={() =>
                        this._onClickStar(this.state.starPercent[index + 5])
                      }
                      key={index}
                      block
                      ghost
                      style={{ padding: 0 }}
                    >
                      <p
                        style={{
                          paddingRight: '20px',
                          display: 'inline',
                        }}
                      >
                        {this.state.starPercent[index + 5]} star
                      </p>
                      <Progress
                        percent={this.state.starPercent[index]}
                        style={{ width: '80%' }}
                      />
                    </Button>
                  );
                })}
              </div>
            )}
          </Col>
          <Col span={3} />
          <Col span={14}>
            <Search
              placeholder="Nhập từ khoá để tìm kiếm bình luận"
              onSearch={this._onSearch}
              enterButton
              style={{ width: '100%', marginBottom: '20px' }}
            />
            <Row>
              <Col span={8}>
                <h2>Sắp xếp</h2>
              </Col>
              <Col span={16}>
                <h2>Lọc</h2>
              </Col>
            </Row>
            <Row>
              <Col span={7}>
                <Cascader
                  options={optionsSort}
                  style={{ width: '100%', marginBottom: '20px' }}
                  value={this.state.optionsSort}
                  onChange={this._onChangeSort}
                />
              </Col>
              <Col span={1} />
              <Col span={7}>
                <Cascader
                  options={optionsDomain}
                  style={{ width: '100%', marginBottom: '20px' }}
                  value={this.state.optionsDomain}
                  onChange={this._onChangeDomain}
                />
              </Col>
              <Col span={1} />
              <Col span={7}>
                <Cascader
                  options={optionsStar}
                  style={{ width: '100%', marginBottom: '20px' }}
                  value={this.state.optionsStar}
                  onChange={this._onChangeStar}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <hr
          style={{
            alignSelf: 'center',
            width: '95%',
            marginTop: '30px',
            marginBottom: '30px',
          }}
        />
        <Row>
          <Col span={1} />
          <Col span={23}>
            {this.state.loadingCmt ? (
              <Spin style={{ margin: '0px 0px 0px 50%' }} size="large" />
            ) : (
              this.state.dataCmts.map((item, index) => (
                <CustomerCmt
                  key={item.id}
                  author={item.author}
                  rate={item.rate}
                  content={item.content}
                  date={Number(item.date)}
                  url={item.product.source.url}
                />
              ))
            )}
          </Col>
        </Row>
        <Row>
          <Col span={1} />
          <Pagination
            current={this.state.page}
            total={this.state.data.totalCmt}
            onChange={this._onChangePage}
            pageSize={10}
            style={{ marginBottom: '30px' }}
          />
        </Row>
      </Wrapper>
    );
  }
}

export default AnalyticsOverview;
