import { ReactNode, useMemo } from 'react';
import { AutoComplete, Form, FormItemProps, Input, InputNumber, Select } from 'antd';
import {
  BarChartOutlined,
  BarcodeOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  QuestionCircleTwoTone,
  ShareAltOutlined,
  SignatureOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import SearchFields from '../../../../types/filterOptions/SearchFields';
import PeakSearch from './searchPanel/peakSearch/PeakSearch';
import MgfUploadButton from './searchPanel/MgfUploadButton';
import PropertyFilterOptionsMenuItems from './searchPanel/msSpecFilter/PropertyFilterOptionsMenuItems';
import StructuralEditor from '../../../basic/StructuralEditor';
import ContentFilterOptions from '../../../../types/filterOptions/ContentFilterOtions';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import { KeyboardEvent } from 'react';
import Tooltip from '../../../basic/Tooltip';
import { Content } from 'antd/es/layout/layout';
import defaultTooltipText from '../../../../constants/defaultTooltipText';
import taxonomyInfo from '../../../../assets/taxonomy_info.json';

const TAXONOMY_RANKS = ['species', 'genus', 'family', 'order', 'class', 'phylum'] as const;
type TaxonomyRank = typeof TAXONOMY_RANKS[number];

function TaxonomyFilterFields({
  insertPlaceholder,
}: {
  insertPlaceholder: (e: KeyboardEvent<HTMLElement>, values: SearchFields) => void;
}) {
  const rank = Form.useWatch(['taxonomyFilterOptions', 'rank']) as TaxonomyRank | undefined;

  const autocompleteOptions = useMemo(() => {
    if (!rank) return [];
    const seen = new Set<string>();
    const opts: { value: string }[] = [];
    for (const row of taxonomyInfo as Record<string, string>[]) {
      const val = row[rank];
      if (val && !seen.has(val)) {
        seen.add(val);
        opts.push({ value: val });
      }
    }
    return opts.sort((a, b) => a.value.localeCompare(b.value));
  }, [rank]);

  return (
    <div style={{ width: '100%' }}>
      <Form.Item
        label="Rank"
        name={['taxonomyFilterOptions', 'rank']}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ width: '100%', marginBottom: 8 }}
      >
        <Select
          placeholder="Select rank"
          allowClear
          style={{ width: '100%' }}
          options={TAXONOMY_RANKS.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
        />
      </Form.Item>
      <Form.Item
        label="Taxon"
        name={['taxonomyFilterOptions', 'taxon']}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ width: '100%', marginBottom: 0 }}
      >
        <AutoComplete
          options={autocompleteOptions}
          placeholder={rank ? `e.g. ${autocompleteOptions[0]?.value ?? ''}` : 'Select a rank first'}
          allowClear
          filterOption={(input, option) =>
            (option?.value ?? '').toLowerCase().includes(input.toLowerCase())
          }
          disabled={!rank}
          onKeyDown={(e: KeyboardEvent<HTMLElement>) =>
            insertPlaceholder(e, {
              taxonomyFilterOptions: { rank: 'genus', taxon: 'Hypoxylon' },
            })
          }
        />
      </Form.Item>
    </div>
  );
}

const peakListPattern: RegExp =
  /^(\d+(\.\d+){0,1} \d+(\.\d+){0,1}( \d+(\.\d+){0,1}){0,1})(\n\d+(\.\d+){0,1} \d+(\.\d+){0,1}( \d+(\.\d+){0,1}){0,1})*$/;

type InputProps = {
  propertyFilterOptions?: ContentFilterOptions | undefined;
  initialStructure?: string;
  insertPlaceholder?: (
    e: KeyboardEvent<HTMLElement>,
    values: SearchFields,
  ) => void;
};

function SearchPanelMenuItems({
  propertyFilterOptions = undefined,
  initialStructure = '',
  insertPlaceholder = () => {},
}: InputProps) {
  const buildFormItemWithTootip = (
    label: string | undefined,
    name: FormItemProps<SearchFields>['name'],
    required: boolean,
    pattern: RegExp | undefined,
    labelColSpan: number,
    wrapperColSpan: number,
    children: ReactNode,
    tooltipText: string | undefined,
  ) => (
    <Content
      style={{
        width: '100%',
        height: '100%',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Content style={{ width: 'calc(100% - 25px)' }}>
        <Form.Item<SearchFields>
          label={label}
          name={name}
          rules={[pattern ? { required, pattern } : { required }]}
          style={{
            width: '100%',
            height: '100%',
          }}
          labelAlign="left"
          labelCol={{ span: labelColSpan }}
          wrapperCol={{ span: wrapperColSpan }}
        >
          {children}
        </Form.Item>
      </Content>
      <Tooltip title={tooltipText}>
        <QuestionCircleTwoTone
          style={{
            width: '25px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      </Tooltip>
    </Content>
  );

  const buildPeakBasedSearchFields = (type: 'peaks' | 'neutralLoss') => [
    {
      key: type + '_panel',
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 0,
      },
      label: <PeakSearch type={type} />,
    },
    {
      key: type + '_massTolerance_peaks',
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 0,
      },
      label: buildFormItemWithTootip(
        'Tolerance',
        ['spectralSearchFilterOptions', type, 'massTolerance'],
        false,
        undefined,
        7,
        17,
        <InputNumber
          placeholder="0.1"
          step={0.01}
          min={0}
          max={1}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
            insertPlaceholder(e, {
              spectralSearchFilterOptions: {
                [type]: {
                  massTolerance: 0.1,
                },
              },
            })
          }
          style={{ width: '100%' }}
        />,
        `This parameter is used as mass tolerance value (+/-) during the search by ${type === 'peaks' ? 'peak masses' : 'peak differences (neutral losses)'}, e.g. 0.1.` +
          ' ' +
          defaultTooltipText,
      ),
    },
    {
      key: type + '_intensity',
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 0,
      },
      label: buildFormItemWithTootip(
        'Min. Intensity',
        ['spectralSearchFilterOptions', type, 'intensity'],
        false,
        undefined,
        7,
        17,
        <InputNumber
          placeholder="50"
          step={5}
          min={0}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
            insertPlaceholder(e, {
              spectralSearchFilterOptions: {
                [type]: {
                  intensity: 50,
                },
              },
            })
          }
          style={{ width: '100%' }}
        />,
        `This parameter forms the lower peak intensity limit during the search by ${type === 'peaks' ? 'peak masses' : 'peak differences (neutral losses)'}, e.g. 50.` +
          ' ' +
          defaultTooltipText,
      ),
    },
  ];

  const items: ItemType<MenuItemType>[] = [
    {
      key: 'compoundSearchFilterOptions',
      label: 'Compound Search',
      icon: <SlidersOutlined />,
      children: [
        {
          key: 'compoundName',
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 0,
          },
          label: buildFormItemWithTootip(
            'Name',
            ['compoundSearchFilterOptions', 'compoundName'],
            false,
            undefined,
            8,
            16,
            <Input
              type="text"
              placeholder="Rickenyl A"
              allowClear
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                insertPlaceholder(e, {
                  compoundSearchFilterOptions: {
                    compoundName: 'Rickenyl A',
                  },
                })
              }
            />,
            'Search by the name of the compound (e.g. Rickenyl A). This value is used during a substring search.' +
              ' ' +
              defaultTooltipText,
          ),
        },
        {
          key: 'compoundClass',
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 0,
          },
          label: buildFormItemWithTootip(
            'Biosynthetic class',
            ['compoundSearchFilterOptions', 'compoundClass'],
            false,
            undefined,
            8,
            16,
            <Input
              type="text"
              placeholder="NRPS-like"
              allowClear
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                insertPlaceholder(e, {
                  compoundSearchFilterOptions: {
                    compoundClass: 'NRPS-like',
                  },
                })
              }
            />,
            'Search by biosynthetic class of the compound (e.g. Polyketide, Terpene, NRPS-like, PKS-NRPS). Substring search.' +
              ' ' +
              defaultTooltipText,
          ),
        },
        {
          key: 'formula',
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 0,
          },
          label: buildFormItemWithTootip(
            'Formula',
            ['compoundSearchFilterOptions', 'formula'],
            false,
            undefined,
            8,
            16,
            <Input
              type="text"
              placeholder="C22H22O6"
              allowClear
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                insertPlaceholder(e, {
                  compoundSearchFilterOptions: {
                    formula: 'C22H22O6',
                  },
                })
              }
            />,
            'Search by a molecular formula of a compound, e.g. C22H22O6.' +
              ' ' +
              defaultTooltipText,
          ),
        },
        {
          key: 'massMin',
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 0,
          },
          label: buildFormItemWithTootip(
            'Mass min',
            ['compoundSearchFilterOptions', 'massMin'],
            false,
            undefined,
            8,
            16,
            <InputNumber
              placeholder="300.0"
              step={1}
              min={0}
              style={{ width: '100%' }}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                insertPlaceholder(e, {
                  compoundSearchFilterOptions: {
                    massMin: 300.0,
                  },
                })
              }
            />,
            'Lower bound of the neutral exact mass range (Da), e.g. 300.0.' +
              ' ' +
              defaultTooltipText,
          ),
        },
        {
          key: 'massMax',
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 0,
          },
          label: buildFormItemWithTootip(
            'Mass max',
            ['compoundSearchFilterOptions', 'massMax'],
            false,
            undefined,
            8,
            16,
            <InputNumber
              placeholder="500.0"
              step={1}
              min={0}
              style={{ width: '100%' }}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                insertPlaceholder(e, {
                  compoundSearchFilterOptions: {
                    massMax: 500.0,
                  },
                })
              }
            />,
            'Upper bound of the neutral exact mass range (Da), e.g. 500.0.' +
              ' ' +
              defaultTooltipText,
          ),
        },
        {
          key: 'exactMass',
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 0,
          },
          label: buildFormItemWithTootip(
            'Exact mass',
            ['compoundSearchFilterOptions', 'exactMass'],
            false,
            undefined,
            8,
            16,
            <InputNumber
              placeholder="386.16"
              step={1}
              min={0}
              style={{ width: '100%' }}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                insertPlaceholder(e, {
                  compoundSearchFilterOptions: {
                    exactMass: 386.16,
                  },
                })
              }
            />,
            'Search by neutral exact mass (Da), e.g. 386.16. Use the tolerance field below to define the allowed deviation.' +
              ' ' +
              defaultTooltipText,
          ),
        },
        {
          key: 'massTolerance',
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 0,
          },
          label: buildFormItemWithTootip(
            'Tolerance',
            ['compoundSearchFilterOptions', 'massTolerance'],
            false,
            undefined,
            8,
            16,
            <InputNumber
              placeholder="0.01"
              step={0.01}
              min={0}
              style={{ width: '100%' }}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                insertPlaceholder(e, {
                  compoundSearchFilterOptions: {
                    massTolerance: 0.01,
                  },
                })
              }
            />,
            'Mass tolerance (Da) for exact mass search, e.g. 0.01.' +
              ' ' +
              defaultTooltipText,
          ),
        },
        {
          key: 'compoundSearchFilterOptions.inchi.menuItem',
          label: 'InChI(Key)',
          icon: <SignatureOutlined />,
          children: [
            {
              key: 'inchi',
              style: {
                width: '100%',
                height: '100%',
                marginLeft: 0,
              },
              label: buildFormItemWithTootip(
                undefined,
                ['compoundSearchFilterOptions', 'inchi'],
                false,
                undefined,
                0,
                24,
                <Input
                  type="text"
                  placeholder="JOVXGJFDWIAZDW-UHFFFAOYSA-N"
                  allowClear
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                    insertPlaceholder(e, {
                      compoundSearchFilterOptions: {
                        inchi: 'JOVXGJFDWIAZDW-UHFFFAOYSA-N',
                      },
                    })
                  }
                />,
                'Search by InChI or InChIKey of a compound (e.g. JOVXGJFDWIAZDW-UHFFFAOYSA-N).' +
                  ' ' +
                  defaultTooltipText,
              ),
            },
          ],
        },
        {
          key: 'compoundSearchFilterOptions.structure.menuItem',
          label: 'Structure',
          icon: <ShareAltOutlined />,
          children: [
            {
              key: 'structure',
              style: {
                width: '100%',
                height: 750,
                marginLeft: 0,
                overflow: 'auto',
              },
              label: (
                <StructuralEditor
                  initialSMILES={initialStructure}
                  insertPlaceholder={insertPlaceholder}
                />
              ),
            },
          ],
        },
      ],
    },
    {
      key: 'spectralSearchFilterOptions',
      label: 'Spectral Search',
      icon: <BarChartOutlined />,
      children: [
        {
          key: 'spectralSearchFilterOptions.similarity.menuItem',
          label: 'Similarity Search',
          children: [
            {
              key: 'similarityPeakList',
              style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 0,
              },
              label: buildFormItemWithTootip(
                'Peak List',
                ['spectralSearchFilterOptions', 'similarity', 'peakList'],
                false,
                peakListPattern,
                7,
                17,
                <Input.TextArea
                  placeholder="245.0432 31&#10;276.0783 94&#10;291.1018 286&#10;304.0727 177&#10;319.0963 209&#10;335.0918 999&#10;336.0883 199&#10;353.1022 190&#10;368.1254 141"
                  autoSize={{ minRows: 5 }}
                  allowClear
                  onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) =>
                    insertPlaceholder(e, {
                      spectralSearchFilterOptions: {
                        similarity: {
                          peakList:
                            '245.0432 31\n276.0783 94\n288.0781 102\n291.1018 286\n292.1047 42\n303.0650 53\n304.0727 177\n305.0796 68\n307.0964 88\n319.0963 209\n320.0670 35\n320.1113 79\n321.0753 30\n335.0918 999\n335.1136 36\n336.0883 199\n353.1022 190\n354.1053 34\n368.1254 141\n369.1301 30',
                        },
                      },
                    })
                  }
                />,
                'Enter m/z and intensity values, delimited by a space, to be used during spectral similarity search.' +
                  ' ' +
                  defaultTooltipText,
              ),
            },
            {
              key: 'mgfUpload',
              style: {
                width: '100%',
                height: '100%',
                marginLeft: 0,
                paddingLeft: 8,
              },
              label: <MgfUploadButton />,
            },
            {
              key: 'similarityThreshold',
              style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 0,
              },
              label: buildFormItemWithTootip(
                'Threshold',
                ['spectralSearchFilterOptions', 'similarity', 'threshold'],
                false,
                undefined,
                7,
                17,
                <InputNumber
                  placeholder="0.8"
                  step={0.05}
                  min={0}
                  max={1}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                    insertPlaceholder(e, {
                      spectralSearchFilterOptions: {
                        similarity: {
                          threshold: 0.8,
                        },
                      },
                    })
                  }
                  style={{ width: '100%' }}
                />,
                'This parameter limits the number of results by setting this similarity score threshold value. It ranges from 0 to 1 (lowest to highest similarity).' +
                  ' ' +
                  defaultTooltipText,
              ),
            },
          ],
        },
        {
          key: 'spectralSearchFilterOptions.peaks.menuItem',
          label: 'Fragment Search',
          children: buildPeakBasedSearchFields('peaks'),
        },
        {
          key: 'spectralSearchFilterOptions.neutralLoss.menuItem',
          label: 'Neutral Loss Search',
          children: buildPeakBasedSearchFields('neutralLoss'),
        },
        {
          key: 'spectralSearchFilterOptions.splash.menuItem',
          label: 'SPLASH',
          icon: <BarcodeOutlined />,
          children: [
            {
              key: 'splash',
              style: {
                width: '100%',
                height: '100%',
                marginLeft: 0,
              },
              label: buildFormItemWithTootip(
                undefined,
                ['spectralSearchFilterOptions', 'splash'],
                false,
                undefined,
                0,
                24,
                <Input
                  type="text"
                  placeholder="splash10-0wmi-0009506000-98ca7f7c8f3072af4481"
                  allowClear
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                    insertPlaceholder(e, {
                      spectralSearchFilterOptions: {
                        splash: 'splash10-0wmi-0009506000-98ca7f7c8f3072af4481',
                      },
                    })
                  }
                />,
                "Search by SPLASH code of a record's mass spectrum (e.g. splash10-0wmi-0009506000-98ca7f7c8f3072af4481)." +
                  ' ' +
                  defaultTooltipText,
              ),
            },
          ],
        },
      ],
    },
  ];

  if (propertyFilterOptions) {
    items.push({
      key: 'propertyFilterOptions',
      label: 'Property Filter',
      icon: <DatabaseOutlined />,
      children: PropertyFilterOptionsMenuItems({ propertyFilterOptions }),
    });
  }

  items.push({
    key: 'taxonomyFilterOptions',
    label: 'Taxonomy Filter',
    icon: <EnvironmentOutlined />,
    children: [
      {
        key: 'taxonomyFields',
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          marginLeft: 0,
        },
        label: <TaxonomyFilterFields insertPlaceholder={insertPlaceholder} />,
      },
    ],
  });

  return items;
}

export default SearchPanelMenuItems;
