import { Content } from 'antd/es/layout/layout';
import { memo } from 'react';
import MycoMSInfo from './MycoMSInfo';
import FeaturesOverview from './FeaturesOverview';

function HomeView() {
  return (
    <Content
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <MycoMSInfo />
      <FeaturesOverview />
    </Content>
  );
}

export default memo(HomeView);
