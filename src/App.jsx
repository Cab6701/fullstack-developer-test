import { useForm, useFieldArray, Controller } from 'react-hook-form';
import {
  AppProvider,
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Text,
  InlineStack,
  BlockStack,
  Badge,
  DataTable,
  Banner,
  Frame,
  Icon,
} from '@shopify/polaris';
import { DeleteIcon, PlusIcon } from '@shopify/polaris-icons';
import '@shopify/polaris/build/esm/styles.css';
import './App.css';
import { useState, useCallback } from 'react';

const discountTypeOptions = [
  { label: 'None', value: 'none' },
  { label: '% discount', value: 'percentage' },
  { label: 'Discount / each', value: 'fixed' },
];

function DiscountForm() {
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    register,
    setValue,
    trigger,
  } = useForm({
    defaultValues: {
      campaignName: '',
      title: '',
      description: '',
      options: [
        {
          id: 1,
          title: '',
          subtitle: '',
          label: '',
          quantity: 1,
          discountType: 'none',
          amount: '',
        },
        {
          id: 2,
          title: '',
          subtitle: '',
          label: '',
          quantity: 2,
          discountType: 'none',
          amount: '',
        },
      ],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const watchOptions = watch('options');
  const watchCampaignName = watch('campaignName');
  const watchTitle = watch('title');

  const onSubmit = async (data) => {
    setSaveError(null);
    setSaveSuccess(false);

    // Validate at least 1 option
    if (!data.options || data.options.length === 0) {
      setSaveError('At least 1 option is required');
      return;
    }

    // Mock API call
    try {
      console.log('Submitting data:', data);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock API endpoint
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignName: data.campaignName,
          title: data.title,
          description: data.description,
          options: data.options,
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        console.log('API Response:', await response.json());
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      setSaveError(error.message || 'An error occurred while saving');
    }
  };

  const handleAddOption = useCallback(() => {
    const lastOption = fields[fields.length - 1];
    const newQuantity = lastOption ? parseInt(lastOption.quantity) + 1 : 1;
    const newId = fields.length > 0 ? Math.max(...fields.map(f => f.id)) + 1 : 1;

    append({
      id: newId,
      title: '',
      subtitle: '',
      label: '',
      quantity: newQuantity,
      discountType: 'none',
      amount: '',
    });
  }, [fields, append]);

  const handleDeleteOption = useCallback((index) => {
    remove(index);
  }, [remove]);

  // Preview table rows
  const previewRows = watchOptions.map((option, index) => [
    option.title || `Option ${index + 1}`,
    option.discountType === 'none' ? 'None' :
      option.discountType === 'percentage' ? '% discount' : 'Discount / each',
    option.quantity?.toString() || '',
    option.discountType === 'none' ? '' :
      option.discountType === 'percentage' ? `${option.amount || 0}%` : `$${option.amount || 0}`,
  ]);

  return (
    <Page
      title="Create volume discount"
      backAction={{ content: 'Back', onAction: () => console.log('Back') }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/* General Section */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  General
                </Text>

                <Controller
                  name="campaignName"
                  control={control}
                  rules={{ required: 'Campaign Name is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Campaign"
                      placeholder="Volume discount #2"
                      autoComplete="off"
                      {...field}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required' }}
                  render={({ field, fieldState }) => (
                    <TextField
                      label="Title"
                      placeholder="Buy more and save"
                      autoComplete="off"
                      {...field}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Description"
                      placeholder="Apply for all products in store"
                      autoComplete="off"
                      {...field}
                    />
                  )}
                />
              </BlockStack>
            </Card>

            {/* Volume Discount Rule Section */}
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Volume discount rule
                </Text>

                <div className="options-list">
                  {fields.map((field, index) => (
                    <div key={field.id} className="option-item">
                      <BlockStack gap="400">
                        <InlineStack align="space-between">
                          <div className="option-label">OPTION {index + 1}</div>
                          {fields.length > 1 && (
                            <Button
                              icon={DeleteIcon}
                              variant="tertiary"
                              onClick={() => handleDeleteOption(index)}
                              accessibilityLabel="Delete option"
                            />
                          )}
                        </InlineStack>

                        <FormLayout>
                          <FormLayout.Group condensed>
                            <Controller
                              name={`options.${index}.title`}
                              control={control}
                              rules={{ required: 'Title is required' }}
                              render={({ field, fieldState }) => (
                                <TextField
                                  label="Title"
                                  placeholder="Single"
                                  autoComplete="off"
                                  {...field}
                                  error={fieldState.error?.message}
                                />
                              )}
                            />

                            <Controller
                              name={`options.${index}.subtitle`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  label="Subtitle"
                                  placeholder="Standard price"
                                  autoComplete="off"
                                  {...field}
                                />
                              )}
                            />

                            <Controller
                              name={`options.${index}.label`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  label="Label (optional)"
                                  placeholder="Popular"
                                  autoComplete="off"
                                  {...field}
                                />
                              )}
                            />
                          </FormLayout.Group>

                          <FormLayout.Group condensed>
                            <Controller
                              name={`options.${index}.quantity`}
                              control={control}
                              rules={{
                                required: 'Quantity is required',
                                pattern: {
                                  value: /^[0-9]+$/,
                                  message: 'Quantity must be a number'
                                }
                              }}
                              render={({ field, fieldState }) => (
                                <TextField
                                  label="Quantity"
                                  type="number"
                                  autoComplete="off"
                                  {...field}
                                  error={fieldState.error?.message}
                                />
                              )}
                            />

                            <Controller
                              name={`options.${index}.discountType`}
                              control={control}
                              render={({ field }) => (
                                <Select
                                  label="Discount type"
                                  options={discountTypeOptions}
                                  {...field}
                                />
                              )}
                            />

                            {watchOptions[index]?.discountType !== 'none' ? (
                              <Controller
                                name={`options.${index}.amount`}
                                control={control}
                                rules={{
                                  required: watchOptions[index]?.discountType !== 'none' ? 'Amount is required' : false,
                                  pattern: {
                                    value: /^[0-9]+(\.[0-9]+)?$/,
                                    message: 'Amount must be a number'
                                  }
                                }}
                                render={({ field, fieldState }) => (
                                  <TextField
                                    label="Amount"
                                    type="number"
                                    autoComplete="off"
                                    {...field}
                                    error={fieldState.error?.message}
                                    suffix={watchOptions[index]?.discountType === 'percentage' ? '%' : '$'}
                                  />
                                )}
                              />
                            ) : (
                              <div style={{ flex: 1 }}></div>
                            )}
                          </FormLayout.Group>
                        </FormLayout>
                      </BlockStack>
                    </div>
                  ))}
                </div>

                <div className="add-option-container">
                  <button
                    type="button"
                    className="add-option-btn"
                    onClick={handleAddOption}
                  >
                    <InlineStack gap="200" align="center">
                      <Icon source={PlusIcon} />
                      <span>Add option</span>
                    </InlineStack>
                  </button>
                </div>
              </BlockStack>
            </Card>

            {/* Save Button */}
            {saveError && (
              <Banner tone="critical">
                <p>{saveError}</p>
              </Banner>
            )}

            {saveSuccess && (
              <Banner tone="success">
                <p>Volume discount saved successfully!</p>
              </Banner>
            )}

            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleSubmit(onSubmit)}
            >
              Save
            </Button>
          </BlockStack>
        </Layout.Section>

        {/* Preview Section */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Preview
              </Text>

              <BlockStack gap="200" alignment="center">
                <Text variant="headingSm" as="h3" alignment="center">
                  {watchTitle || 'Buy more and save'}
                </Text>
                <Text variant="bodySm" as="p" alignment="center" tone="subdued">
                  {watch('description') || 'Apply for all products in store'}
                </Text>
              </BlockStack>

              <DataTable
                columnContentTypes={['text', 'text', 'numeric', 'text']}
                headings={['Title', 'Discount Type', 'Quantity', 'Amount']}
                rows={previewRows}
              />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function App() {
  return (
    <AppProvider i18n={{}}>
      <Frame>
        <DiscountForm />
      </Frame>
    </AppProvider>
  );
}

export default App;