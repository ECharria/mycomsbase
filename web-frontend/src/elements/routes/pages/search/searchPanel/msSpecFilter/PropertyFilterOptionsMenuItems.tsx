import { AutoComplete, Form, InputNumber } from 'antd';
import FilterTable from '../../../../../common/FilterTable';
import SearchFields from '../../../../../../types/filterOptions/SearchFields';
import ContentFilterOptions from '../../../../../../types/filterOptions/ContentFilterOtions';


type InputProps = {
  propertyFilterOptions: ContentFilterOptions | undefined;
  showCounts?: boolean;
};

function PropertyFilterOptionsMenuItems({
  propertyFilterOptions,
  showCounts = false,
}: InputProps) {
  return [
    {
      key: 'propertyFilterOptions.ion_mode',
      label: 'Ion Mode',
      children: [
        {
          key: 'ionMode',
          style: { width: '100%', height: '100%', marginLeft: 0, overflow: 'auto' },
          label: (
            <Form.Item<SearchFields>
              name={['propertyFilterOptions', 'ion_mode']}
              rules={[{ required: false }]}
              style={{ width: '100%', height: '100%' }}
            >
              <FilterTable
                filterOptions={propertyFilterOptions?.ion_mode ?? []}
                filterName="propertyFilterOptions"
                label="ion_mode"
                height={30}
                showCounts={showCounts}
              />
            </Form.Item>
          ),
        },
      ],
    },
    {
      key: 'propertyFilterOptions.adduct_type',
      label: 'Adduct Type',
      children: [
        {
          key: 'adductType',
          style: { width: '100%', height: '100%', marginLeft: 0, overflow: 'auto' },
          label: (
            <Form.Item<SearchFields>
              name={['propertyFilterOptions', 'adduct_type']}
              rules={[{ required: false }]}
              style={{ width: '100%', height: '100%' }}
            >
              <AutoComplete
                placeholder="[M+H]+"
                allowClear
                style={{ width: '100%' }}
                options={[
                  '[M+H]+', '[M+Na]+', '[M+K]+', '[M+NH4]+',
                  '[M-H]-', '[M+Cl]-', '[M+HCOO]-',
                  '[M+H-H2O]+', '[M+H-2H2O]+',
                  '[M+2H]2+', '[M+2Na]2+',
                ].map((v) => ({ value: v }))}
                filterOption={(input, option) =>
                  (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          ),
        },
      ],
    },
    {
      key: 'propertyFilterOptions.ccs',
      label: 'CCS Range',
      children: [
        {
          key: 'ccsMin',
          style: { width: '100%', height: '100%', marginLeft: 0 },
          label: (
            <Form.Item<SearchFields>
              label="Min (Å²)"
              name={['propertyFilterOptions', 'ccs_min']}
              rules={[{ required: false }]}
              style={{ width: '100%' }}
              labelAlign="left"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <InputNumber
                placeholder="150"
                step={10}
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          ),
        },
        {
          key: 'ccsMax',
          style: { width: '100%', height: '100%', marginLeft: 0 },
          label: (
            <Form.Item<SearchFields>
              label="Max (Å²)"
              name={['propertyFilterOptions', 'ccs_max']}
              rules={[{ required: false }]}
              style={{ width: '100%' }}
              labelAlign="left"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
            >
              <InputNumber
                placeholder="300"
                step={10}
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          ),
        },
      ],
    },
  ];
}

export default PropertyFilterOptionsMenuItems;
