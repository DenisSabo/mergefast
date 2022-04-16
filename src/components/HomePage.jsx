import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Heading,
  ResourceList,
  TextField,
  TextStyle,
  Thumbnail,
  Badge,
  Modal,
  Button,
  Select,
  Spinner,
  Icon,
  Scrollable,
} from "@shopify/polaris";
import React, { useState, useCallback, useRef, useEffect } from "react";
import gql from "graphql-tag";
import { useMutation, useQuery } from "@apollo/client";
import { Query } from "@apollo/client/react/components";
// import { Query } from 'react-apollo'; // TODO maybe @apollo/client has the Query dependency...
import parse from "html-react-parser";
// TODO very old, unmaintained dependency. Maybe replace it with something else.
import store from "store-js";

import { RiskMajor, CircleTickOutlineMinor } from "@shopify/polaris-icons";
import _ from "lodash";

import trophyImgUrl from "../assets/home-trophy.png";

import { ProductsCard } from "./ProductsCard";

/**
export function HomePage() {
  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Heading>Nice work on building a Shopify app 🎉</Heading>
                  <p>
                    Your app is ready to explore! It contains everything you
                    need to get started including the{" "}
                    <Link url="https://polaris.shopify.com/" external>
                      Polaris design system
                    </Link>
                    ,{" "}
                    <Link url="https://shopify.dev/api/admin-graphql" external>
                      Shopify Admin API
                    </Link>
                    , and{" "}
                    <Link
                      url="https://shopify.dev/apps/tools/app-bridge"
                      external
                    >
                      App Bridge
                    </Link>{" "}
                    UI library and components.
                  </p>
                  <p>
                    Ready to go? Start populating your app with some sample
                    products to view and test in your store.{" "}
                  </p>
                  <p>
                    Learn more about building out your app in{" "}
                    <Link
                      url="https://shopify.dev/apps/getting-started/add-functionality"
                      external
                    >
                      this Shopify tutorial
                    </Link>{" "}
                    📚{" "}
                  </p>
                </TextContainer>
              </Stack.Item>
              <Stack.Item>
                <div style={{ padding: "0 20px" }}>
                  <Image
                    source={trophyImgUrl}
                    alt="Nice work on building a Shopify app"
                    width={120}
                  />
                </div>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}

 */

const POST_PRODUCT = gql`
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        title
        variants(first: 5) {
          edges {
            node {
              inventoryQuantity
              selectedOptions {
                name
                value
              }
              media(first: 10) {
                edges {
                  node {
                    alt
                    mediaContentType
                    status
                    __typename
                    ... on MediaImage {
                      id
                      preview {
                        image {
                          originalSrc
                        }
                      }
                      __typename
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// GraphQL query to retrieve products by IDs.
// The price field belongs to the variants object because
// variations of a product can have different prices.
const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        description
        descriptionHtml
        tags
        tracksInventory
        vendor
        id
        collections(first: 10) {
          edges {
            node {
              handle
              title
            }
          }
        }
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 5) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              price
              compareAtPrice
              id
              sku
              inventoryQuantity
              inventoryPolicy
              inventoryManagement
              title
              availableForSale
              taxCode
              taxable
              weight
              weightUnit
              barcode
              harmonizedSystemCode
              requiresShipping
              fulfillmentService {
                id
                handle
                serviceName
              }
              selectedOptions {
                name
                value
              }
              media(first: 10) {
                edges {
                  node {
                    alt
                    mediaContentType
                    status
                    __typename
                    ... on MediaImage {
                      id
                      preview {
                        image {
                          originalSrc
                        }
                      }
                      __typename
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
const GET_PRODUCTS_VARIANTS_BY_ID = gql`
  query getProducts($ids: [ID!]!, $cursor: String) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        description
        descriptionHtml
        tags
        tracksInventory
        vendor
        id
        collections(first: 10) {
          edges {
            node {
              handle
              title
            }
          }
        }
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 5, after: $cursor) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              price
              compareAtPrice
              id
              sku
              inventoryQuantity
              inventoryPolicy
              inventoryManagement
              title
              availableForSale
              taxCode
              taxable
              weight
              weightUnit
              barcode
              harmonizedSystemCode
              requiresShipping
              fulfillmentService {
                id
                handle
                serviceName
              }
              selectedOptions {
                name
                value
              }
              media(first: 10) {
                edges {
                  node {
                    alt
                    mediaContentType
                    status
                    __typename
                    ... on MediaImage {
                      id
                      preview {
                        image {
                          originalSrc
                        }
                      }
                      __typename
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
**/

const GET_PRODUCTS_VARIANTS_BY_ID = gql`
  query GetProductsById($id: ID!, $cursor: String) {
    product(id: $id) {
      title
      id
      collections(first: 10) {
        edges {
          node {
            handle
            title
          }
        }
      }
      images(first: 1) {
        edges {
          node {
            originalSrc
            altText
          }
        }
      }
      variants(first: 5, after: $cursor) {
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        edges {
          cursor
          node {
            price
            compareAtPrice
            id
            sku
            inventoryQuantity
            inventoryPolicy
            inventoryManagement
            title
            availableForSale
            taxCode
            taxable
            weight
            weightUnit
            barcode
            harmonizedSystemCode
            requiresShipping
            fulfillmentService {
              id
              handle
              serviceName
            }
            selectedOptions {
              name
              value
            }
            media(first: 10) {
              edges {
                node {
                  alt
                  mediaContentType
                  status
                  __typename
                  ... on MediaImage {
                    id
                    preview {
                      image {
                        originalSrc
                      }
                    }
                    __typename
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export function HomePage() {
  const statusOptions = [
    { label: "Draft", value: "DRAFT" },
    { label: "Active", value: "ACTIVE" },
  ];
  const mountedRef = useRef();
  const [state, setState] = useState({});
  const [apiState, setApiState] = useState({
    status: statusOptions[0].value,
  });
  const [postError, setPostError] = useState();
  const [maybeDeleteOption, setMaybeDeleteOption] = useState([]);
  const [optionToDelete, setOptionToDelete] = useState([]);
  const [merging, setMerging] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  /**
   * Modal states
   */
  const [clearButtonNotice, setClearButtonNotice] = useState(false);
  const [mergeDialog, setMergeDialog] = useState(false);
  const [fetchedAll, setFetchedAll] = useState(false);
  useEffect(() => {}, [fetchedAll]);

  const getFormattedAPIState = () => {
    const variants = [];
    let options = [];
    let variantCounter = 1;
    const images = [];

    for (const [key, value] of Object.entries(apiState)) {
      if (!isStandardProductionOption(key)) {
        // If not standard option => must be a product handle, which contains an array of variants
        if (Array.isArray(value)) {
          value.forEach((variant) => {
            // Translate variant accordingly to API requirements
            // https://shopify.dev/api/admin-graphql/2021-10/input-objects/ProductVariantInput
            // TODO put in own function "mapForApi"
            let apiVariant = {};
            for (const [key, value] of Object.entries(variant)) {
              if (key === "sku") {
                if (value) {
                  apiVariant.sku = value;
                  // apiVariant.barcode = variantCounter.toString();
                }
              } else if (key === "title") {
                if (value) {
                  apiVariant.title = value;
                }
              } else if (key === "inventoryQuantity") {
                if (value) {
                  apiVariant.inventoryQuantity = value;
                }
              } else if (key === "weight") {
                if (value) {
                  apiVariant.weight = value;
                }
              } else if (key === "inventoryPolicy") {
                if (value) {
                  apiVariant.inventoryPolicy = value;
                }
              } else if (key === "availableForSale") {
                if (value) {
                  apiVariant.availableForSale = value;
                }
              } else if (key === "taxable") {
                if (value) {
                  apiVariant.taxable = value;
                }
              } else if (key === "taxCode") {
                if (value) {
                  apiVariant.taxCode = value;
                }
              } else if (key === "weightUnit") {
                if (value) {
                  apiVariant.weightUnit = value;
                }
              } else if (key === "price") {
                if (value) {
                  apiVariant.price = parseInt(value);
                }
              } else if (key === "compareAtPrice") {
                if (value) {
                  apiVariant.compareAtPrice = parseInt(value);
                }
              } else if (key === "barcode") {
                if (value) {
                  apiVariant.barcode = value;
                }
              } else if (key === "harmonizedSystemCode") {
                if (value) {
                  apiVariant.harmonizedSystemCode = value;
                }
              } else if (key === "requiresShipping") {
                if (value) {
                  apiVariant.requiresShipping = value;
                }
              } else if (key === "inventoryManagement") {
                if (value) {
                  apiVariant.inventoryManagement = value;
                }
              } else if (key === "imageSrc") {
                if (value) {
                  apiVariant.imageSrc = value;
                  // A variant image must also be an image of the product
                  images.push({
                    src: value,
                  });
                }
              } else if (key === "imageId") {
                // do nothing
              } else {
                let alreadyInOptions = false;
                options.forEach((option) => {
                  if (key === option) alreadyInOptions = true;
                });

                if (!alreadyInOptions) {
                  options.push(key);
                }

                if (!Array.isArray(apiVariant.options)) {
                  apiVariant.options = [value];
                } else {
                  apiVariant.options.push(value);
                }
              }
            }

            apiVariant.position = variantCounter++;
            variants.push(apiVariant);
          });
        }
      }
    }

    let errMsg = "";

    if (
      !apiState.title ||
      typeof apiState.title !== "string" ||
      apiState.title.length === 0
    ) {
      const titleErr = "Title of product cannot be empty. ";
      titleErr ? (errMsg = errMsg + wrapAroundLiElements(titleErr)) : null;
    }

    let validateOptionsError = validateOptionsAmount(options);
    validateOptionsError
      ? (errMsg = errMsg + wrapAroundLiElements(validateOptionsError))
      : null;

    // TODO check validation function (write tests????)
    let validateVariantsAmountError = validateVariantsAmount(variants);
    validateVariantsAmountError
      ? (errMsg = errMsg + wrapAroundLiElements(validateVariantsAmountError))
      : null;

    let variantOptions = [];
    variants.forEach((variant) => {
      if (
        variant.options &&
        Array.isArray(variant.options) &&
        variant.options.length !== 0
      )
        variantOptions.push(variant.options);
    });
    let validateVariantOptionsError = validateVariantOptionValues(
      variantOptions,
      options
    );
    validateVariantOptionsError
      ? (errMsg = errMsg + validateVariantOptionsError)
      : null;

    if (errMsg) {
      setPostError(errMsg);
    } else {
      // Reset error...
      setPostError(null);

      return {
        input: {
          title: apiState.title,
          status: apiState.status,
          descriptionHtml: apiState.description,
          options,
          variants: variants,
          images: images,
        },
      };
    }
  };
  const createNewProduct = () => {
    // opens the merge dialog
    setMergeDialog(true);
    // true until API returns response
    setMerging(true);

    if (mountedRef.current) {
      const input = getFormattedAPIState();

      if (input) {
        postProduct({ variables: input })
          .then((data) => {
            setMerging(false);
          })
          .catch((err) => {
            setPostError(err);
            setMerging(false);
          });
      } else {
        // Found error when validating input data.
        setMerging(false);
      }
    }
  };
  const [postProduct, data] = useMutation(POST_PRODUCT);
  const {
    getProductsLoading,
    getProductsError,
    getProductsData,
    refetch,
    networkStatus,
  } = useQuery(GET_PRODUCTS_VARIANTS_BY_ID);

  /**
   * State changes
   */
  const setDefaultState = (defaultValue, id) => {
    state[id] = defaultValue;
    setState(state);
    setDefaultApiState(defaultValue, id);
  };
  const setDefaultApiState = (defaultValue, id) => {
    _.set(apiState, id, defaultValue);
    setApiState(apiState);
  };
  const handleApiChange = (newValue, id) => {
    _.set(apiState, id, newValue);
    setApiState(apiState);
  };
  const handleTitleChange = (newValue) => {
    setApiState({
      ...apiState,
      title: newValue,
    });
  };
  const handleStatusOptionChange = (newValue) => {
    setApiState({
      ...apiState,
      status: newValue,
    });
  };
  const handleDescriptionChange = (newValue) => {
    setApiState({
      ...apiState,
      description: newValue,
    });
  };
  const handleChange = (newValue, id) => {
    setState({
      ...state,
      [id]: newValue,
    });
    handleApiChange(newValue, id);
  };
  const showOptionClearNotice = (id) => {
    setClearButtonNotice(true);

    // TODO dieser Split führt zu Problemen falls im Namen der Option ein Punkt enhalten ist. (oder sonst wo?)
    const idParts = id.split(".");
    const option = idParts[idParts.length - 1];

    setMaybeDeleteOption(option);
  };
  const handleClear = () => {
    optionToDelete.push(maybeDeleteOption);
    setOptionToDelete(optionToDelete);

    for (const [key, value] of Object.entries(apiState)) {
      if (!isStandardProductionOption(key)) {
        if (Array.isArray(apiState[key])) {
          apiState[key].forEach((variant) => {
            delete variant[maybeDeleteOption];
          });
        }
      }
    }

    setClearButtonNotice(false);
  };

  /**
   * Dialog stuff
   */
  const handleClearButtonNoticeClose = useCallback(
    () => setClearButtonNotice(!clearButtonNotice),
    [clearButtonNotice]
  );
  const handleMergeDialogClose = useCallback(
    () => setMergeDialog(false),
    [mergeDialog]
  );

  /**
   * Validation functions.
   */
  const validateNonStandardOptionBeforeSubmit = (value) => {
    if (!value) return "Cannot be empty";
  };
  const validateTitleBeforeSubmit = (value) => {
    if (!value) return "Cannot be empty";
  };
  const validateOptionsAmount = (options) => {
    let errorMessage;
    if (Array.isArray(options)) {
      if (options.length > 3) {
        errorMessage =
          "Cannot be more than 3 custom options (Shopify restriction): You have " +
          options.length +
          ": " +
          options;
      }
    }
    return errorMessage;
  };
  // TODO can be implemented more efficiently
  const validateVariantOptionValues = (allVariantOptions, options) => {
    let errorMessage = "";
    // variant options must be different from one another
    let duplicateValues = false;
    // Must be the same for each variant options
    let someOptionsEmpty = false;

    if (Array.isArray(allVariantOptions) && allVariantOptions.length !== 0) {
      // Check if there are option values that are the same
      allVariantOptions.forEach((variantOptions, index1) => {
        if (Array.isArray(variantOptions)) {
          // Check for duplicate values
          allVariantOptions.forEach((variantOptions2, index2) => {
            if (index1 !== index2) {
              if (arraysEqual(variantOptions, variantOptions2))
                duplicateValues = true;
            }
          });
          // Check for length
          // if(variantOptions.length !== optionValueLength) optionValueLengthTheSame = false;
          variantOptions.forEach((option) => {
            if (!option || !option.length || option.length === 0)
              someOptionsEmpty = true;
          });
        }
      });
    }

    let optionsAsString = options.join(", ");
    if (someOptionsEmpty) {
      errorMessage =
        errorMessage +
        wrapAroundLiElements(optionsAsString + " cannot be empty.");
    }

    if (duplicateValues) {
      errorMessage =
        errorMessage +
        wrapAroundLiElements(
          "The following options cannot have the same values: " +
            optionsAsString
        );
    }

    return errorMessage;
  };
  const validateVariantsAmount = (variants) => {
    if (variants.length > 100) {
      return "Too many variants. Up to 100 variants are allowed. (https://help.shopify.com/en/manual/products/variants/add-variants)";
    }
  };

  /**
   * Helper functions
   */
  const arraysEqual = (a1, a2) => {
    /* WARNING: arrays must not contain {objects} or behavior may be undefined */
    return JSON.stringify(a1) === JSON.stringify(a2);
  };
  /**
   * Check if passed option is a standard API state option like title or status...
   *
   * @param option of the product
   * @returns {boolean} if false: must be a product handle
   */
  const isStandardProductionOption = (option) => {
    // Subset of the following arguments: https://shopify.dev/api/admin-graphql/2021-10/mutations/productcreate
    return option === "title" || option === "status";
  };
  const wrapAroundLiElements = (valueToWrapAround) => {
    return "<li>" + valueToWrapAround + "</li>";
  };

  const getMoreVariantsOfProduct = async (product, cb) => {
    if (product.variants.pageInfo.hasNextPage) {
      const lastCursor =
        product.variants.edges[product.variants.edges.length - 1].cursor;

      const result = await refetch({
        id: product.id,
        cursor: lastCursor,
      });

      if (result.data?.product?.variants?.edges) {
        // product.variants.edges = product.variants.edges.concat(result.data.product.variants.edges);
        product.variants.edges = product.variants.edges.concat(
          result.data.product.variants.edges
        );

        if (result.data.product.variants.pageInfo.hasNextPage) {
          // product = await getMoreVariantsOfProduct(result.data.product);
          getMoreVariantsOfProduct(product, (nextFetchResult) => {
            return cb(product);
          });
        } else {
          return cb(product);
        }
      } else {
        console.log("Something went wrong: ", result);
      }
    } else {
      return cb(product);
    }
  };

  return (
    // GraphQL query to retrieve products and their prices
    <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: store.get("ids") }}>
      {({ data, loading, error }) => {
        if (loading)
          return <Spinner accessibilityLabel="Spinner example" size="large" />;
        if (error) return <div>{error.message}</div>;

        if (!mountedRef.current && isFirstRender) {
          if (data.nodes && Array.isArray(data.nodes)) {
            let counter = 0;

            data.nodes.forEach((product, index) => {
              getMoreVariantsOfProduct(product, (result) => {
                counter++;
                product = result;
                if (counter === data.nodes.length) {
                  setFetchedAll(true);
                }
              });
            });
          }
        }

        setIsFirstRender(false);

        if (!fetchedAll)
          return <Spinner accessibilityLabel="Spinner example" size="large" />;

        let uniqueOptionTypes = [];

        // Necessary to set variable "mountedRef.current" later, if last product was iterated through
        const productLength = data.nodes.length;

        data.nodes.forEach((node) => {
          if (!mountedRef.current && node.descriptionHtml) {
            if (apiState.description) {
              const newProductDescription =
                apiState.description +
                `

<br /><br />

` +
                node.descriptionHtml;
              handleChange(newProductDescription, "description");
            } else {
              setDefaultState(node.descriptionHtml, "description");
            }
          }
        });

        return (
          <div>
            <div className={"product-form"}>
              <div className={"product-input"}>
                <TextField
                  onChange={handleTitleChange}
                  label="New product name"
                  type="text"
                  value={apiState.title}
                  helpText={
                    <span>This is the name used for your merged product.</span>
                  }
                  error={validateTitleBeforeSubmit(apiState.title)}
                />
              </div>
              <div className={"product-input"}>
                <Select
                  label="Status"
                  options={statusOptions}
                  value={apiState.status}
                  onChange={handleStatusOptionChange}
                />
              </div>

              <div className={"product-input"}>
                <Scrollable style={{ height: "250px" }}>
                  <TextField
                    onChange={handleDescriptionChange}
                    label="New product description"
                    type="text"
                    value={apiState.description}
                    multiline={8}
                  />
                </Scrollable>
              </div>

              <div className={"toolbox"}>
                <div className={"toolbox-item"}>
                  <Button primary={true} onClick={createNewProduct}>
                    Merge
                  </Button>
                </div>
              </div>
            </div>

            <Modal
              // activator={activator}
              open={clearButtonNotice}
              onClose={handleClearButtonNoticeClose}
              title="Delete option for all?"
              primaryAction={{
                content: "Delete option",
                onAction: handleClear,
              }}
              secondaryActions={[
                {
                  content: "Cancel",
                  onAction: handleClearButtonNoticeClose,
                },
              ]}
            >
              <Modal.Section>
                <div>
                  <p>
                    This option will be deleted for all product variants. Do you
                    want to proceed?
                  </p>
                </div>
              </Modal.Section>
            </Modal>

            <Modal
              open={mergeDialog}
              onClose={handleMergeDialogClose}
              title={merging ? "Merging..." : "Merge result"}
              secondaryActions={[
                {
                  content: "Close",
                  onAction: handleMergeDialogClose,
                  disabled: merging, // as long as API has not returned a response => Disable close button
                },
              ]}
            >
              {merging ? (
                <Modal.Section>
                  {" "}
                  <Spinner accessibilityLabel="Spinner example" size="large" />
                </Modal.Section>
              ) : postError ? (
                <div className={"modal-merge-content-container"}>
                  <Icon source={RiskMajor} color="critical" />
                  <ul className={"error modal-merge-content-item-big"}>
                    {parse(postError)}
                  </ul>
                </div>
              ) : (
                <div className={"modal-merge-content-container"}>
                  <Icon source={CircleTickOutlineMinor} color="success" />
                  <p className={"success modal-merge-content-item-big"}>
                    Success
                  </p>
                </div>
              )}
            </Modal>

            <div className={"variant-display"}>
              <Card>
                <ResourceList // Defines your resource list component
                  showHeader
                  resourceName={{ singular: "Product", plural: "Products" }}
                  items={data.nodes}
                  renderItem={(item, id, productIndex) => {
                    const title = item.title;
                    let description = item.description;
                    if (description.length > 290) {
                      description = description.slice(0, 290) + "...";
                    }
                    const handle = item.handle;

                    // Necessary to set variable "mountedRef.current" later, if last product was iterated through
                    const variantsLength = item.variants.edges.length;

                    return (
                      <Card>
                        <Stack>
                          <Stack.Item fill>
                            <h3 className={"product-title"}>
                              <TextStyle variation="strong">{title}</TextStyle>
                            </h3>
                            <p className={"product-description"}>
                              {description}
                            </p>
                          </Stack.Item>
                        </Stack>
                        <ResourceList // Defines your resource list component
                          showHeader
                          resourceName={{
                            singular: "Variant",
                            plural: "Variants",
                          }}
                          items={item.variants.edges}
                          renderItem={(item, id, variantIIndex) => {
                            uniqueOptionTypes = buildUniqueOptions(
                              uniqueOptionTypes,
                              item.node.selectedOptions
                            );
                            addMissingOptions(uniqueOptionTypes, item);

                            const optionPrice = item.node.price;
                            const itemSKU = item.node.sku;
                            let imageSrc;
                            if (
                              item.node.media &&
                              item.node.media.edges &&
                              item.node.media.edges[0] &&
                              item.node.media.edges[0].node &&
                              item.node.media.edges[0].node.preview &&
                              item.node.media.edges[0].node.preview.image &&
                              item.node.media.edges[0].node.preview.image
                                .originalSrc
                            ) {
                              imageSrc =
                                item.node.media.edges[0].node.preview.image
                                  .originalSrc;
                            }
                            // const imageId = item.node.media.edges[0].node.id;

                            // If mountedRef.current flag is set, do not set to default state...
                            if (!mountedRef.current) {
                              setDefaultState(
                                optionPrice,
                                `${handle}.${variantIIndex}.price`
                              );
                              setDefaultState(
                                itemSKU,
                                `${handle}.${variantIIndex}.sku`
                              );
                              if (imageSrc) {
                                setDefaultState(
                                  imageSrc,
                                  `${handle}.${variantIIndex}.imageSrc`
                                );
                              }
                              if (item.node.compareAtPrice) {
                                setDefaultState(
                                  item.node.compareAtPrice,
                                  `${handle}.${variantIIndex}.compareAtPrice`
                                );
                              }
                              //if(item.node.inventoryQuantity) {
                              //  setDefaultState(item.node.inventoryQuantity, `${handle}.${variantIIndex}.inventoryQuantity`);
                              //}
                              if (item.node.inventoryPolicy) {
                                setDefaultState(
                                  item.node.inventoryPolicy,
                                  `${handle}.${variantIIndex}.inventoryPolicy`
                                );
                              }
                              if (item.node.inventoryManagement) {
                                setDefaultState(
                                  item.node.inventoryManagement,
                                  `${handle}.${variantIIndex}.inventoryManagement`
                                );
                              }
                              if (item.node.displayName) {
                                setDefaultState(
                                  item.node.displayName,
                                  `${handle}.${variantIIndex}.displayName`
                                );
                              }
                              if (item.node.title) {
                                setDefaultState(
                                  item.node.title,
                                  `${handle}.${variantIIndex}.title`
                                );
                              }
                              // if(item.node.availableForSale) {
                              //  setDefaultState(item.node.availableForSale, `${handle}.${variantIIndex}.availableForSale`);
                              //}
                              if (item.node.taxCode) {
                                setDefaultState(
                                  item.node.taxCode,
                                  `${handle}.${variantIIndex}.taxCode`
                                );
                              }
                              if (item.node.taxable) {
                                setDefaultState(
                                  item.node.taxable,
                                  `${handle}.${variantIIndex}.taxable`
                                );
                              }
                              if (item.node.weight) {
                                setDefaultState(
                                  item.node.weight,
                                  `${handle}.${variantIIndex}.weight`
                                );
                              }
                              if (item.node.weightUnit) {
                                setDefaultState(
                                  item.node.weightUnit,
                                  `${handle}.${variantIIndex}.weightUnit`
                                );
                              }
                              if (item.node.barcode) {
                                setDefaultState(
                                  item.node.barcode,
                                  `${handle}.${variantIIndex}.barcode`
                                );
                              }
                              if (item.node.harmonizedSystemCode) {
                                setDefaultState(
                                  item.node.harmonizedSystemCode,
                                  `${handle}.${variantIIndex}.harmonizedSystemCode`
                                );
                              }
                              if (item.node.requiresShipping) {
                                setDefaultState(
                                  item.node.requiresShipping,
                                  `${handle}.${variantIIndex}.requiresShipping`
                                );
                              }
                              /**
                                 fulfillmentService {
                                  id
                                  handle
                                  serviceName
                                }
                                 */
                            }

                            // Necessary to set variable "mountedRef.current" later, if last product was iterated through
                            const optionsLength =
                              item.node.selectedOptions.length;

                            const media = (
                              <Thumbnail
                                source={
                                  item.node.media.edges[0]
                                    ? item.node.media.edges[0].node.preview
                                        .image.originalSrc
                                    : ""
                                }
                                alt={
                                  item.node.media.edges[0]
                                    ? item.node.media.edges[0].node.altText
                                    : ""
                                }
                              />
                            );

                            return (
                              <ResourceList.Item media={media} id={item.id}>
                                <Stack className="subdued">
                                  <Stack.Item>
                                    <h3>
                                      <TextStyle variation="strong">
                                        {title}
                                      </TextStyle>
                                    </h3>
                                    <p>Variant</p>
                                    <h3>
                                      <TextStyle variation="strong">
                                        Price
                                      </TextStyle>
                                    </h3>
                                    <TextField
                                      value={
                                        state[
                                          `${handle}.${variantIIndex}.price`
                                        ]
                                      }
                                      id={`${handle}.${variantIIndex}.price`}
                                      onChange={handleChange}
                                      inputMode={"numeric"}
                                    />
                                    <h3>
                                      <TextStyle variation="strong">
                                        SKU
                                      </TextStyle>
                                    </h3>
                                    <TextField
                                      value={
                                        state[`${handle}.${variantIIndex}.sku`]
                                      }
                                      id={`${handle}.${variantIIndex}.sku`}
                                      onChange={handleChange}
                                      inputMode={"text"}
                                    />
                                  </Stack.Item>
                                  <Stack.Item fill>
                                    <h3>
                                      {item.node.selectedOptions.map(function (
                                        { name, value, isAdded, __typename },
                                        index
                                      ) {
                                        if (optionToDelete.includes(name)) {
                                          return;
                                        }

                                        const id =
                                          handle +
                                          "." +
                                          variantIIndex +
                                          "." +
                                          name;

                                        // If mountedRef.current flag is set, do not set to default state...
                                        if (!mountedRef.current) {
                                          setDefaultState(value, id);
                                        }

                                        // Sets mountedRef.current flag so values in input fields do NOT get reset after each render, which happens after each value change in input fields
                                        if (
                                          productLength - 1 === productIndex &&
                                          variantsLength - 1 ===
                                            variantIIndex &&
                                          optionsLength - 1 === index
                                        ) {
                                          mountedRef.current = true;
                                        }
                                        return (
                                          <li
                                            className={"variant-list"}
                                            key={index}
                                          >
                                            <TextStyle variation="strong">
                                              {name}
                                            </TextStyle>
                                            :{" "}
                                            {isAdded ? (
                                              <Badge status={"info"}>
                                                Added
                                              </Badge>
                                            ) : (
                                              ""
                                            )}{" "}
                                            <TextField
                                              value={state[id]}
                                              error={validateNonStandardOptionBeforeSubmit(
                                                state[id]
                                              )}
                                              id={id}
                                              onChange={handleChange}
                                              clearButton={true}
                                              onClearButtonClick={
                                                showOptionClearNotice
                                              }
                                            />
                                          </li>
                                        );
                                      })}
                                    </h3>
                                  </Stack.Item>
                                </Stack>
                              </ResourceList.Item>
                            );
                          }}
                        />
                      </Card>
                    );
                  }}
                />
              </Card>
            </div>
          </div>
        );
      }}
    </Query>
  );
}

function buildUniqueOptions(uniqueOptionTypes, options) {
  options.forEach((option) => {
    let alreadyInArr = false;
    uniqueOptionTypes.forEach((uniqueOption) => {
      if (uniqueOption.name === option.name) {
        alreadyInArr = true;
      }
    });

    if (!alreadyInArr) {
      uniqueOptionTypes.push(option);
    }
  });

  return uniqueOptionTypes;
}

/**
 * When merging a product it is necessary to provide the same options for each product variant.
 *
 * @param uniqueOptionTypes all options available
 * @param variantToFill the product variant that may need to be filled with missing options
 * @returns {*}
 */
function addMissingOptions(uniqueOptionTypes, variantToFill) {
  uniqueOptionTypes.forEach((uniqueOption) => {
    let doesAlreadyExist = false;

    variantToFill.node.selectedOptions.forEach((variantOption) => {
      // Check if passed variant has all options that exist
      if (uniqueOption.name === variantOption.name) {
        doesAlreadyExist = true;
      }
    });

    // Option does not already exist in variant
    if (!doesAlreadyExist) {
      // Add meta information that this variant was added to option

      // Reference logic of JS does not work here... Must be a clone or else the isAdded variable behaves not as expected
      const uniqueOptionClone = _.cloneDeep(uniqueOption);
      // do not use value, because user may get irritated
      delete uniqueOptionClone["value"];
      uniqueOptionClone.isAdded = true;

      // Add option to variant
      variantToFill.node.selectedOptions.push(uniqueOptionClone);
    }
  });

  // Sort options in variant alphabetically
  variantToFill.node.selectedOptions = variantToFill.node.selectedOptions.sort(
    (variantA, variantB) => {
      if (variantA.name < variantB.name) {
        return -1;
      }
      if (variantA.name > variantB.name) {
        return 1;
      }
      return 0;
    }
  );

  return variantToFill;
}
