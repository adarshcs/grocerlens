import { getUncachableRevenueCatClient } from "./revenueCatClient";

import {
  listProjects,
  createProject,
  listApps,
  createApp,
  listAppPublicApiKeys,
  listProducts,
  createProduct,
  listEntitlements,
  createEntitlement,
  attachProductsToEntitlement,
  listOfferings,
  createOffering,
  updateOffering,
  listPackages,
  createPackages,
  attachProductsToPackage,
  type App,
  type Product,
  type Project,
  type Entitlement,
  type Offering,
  type Package,
  type CreateProductData,
} from "@replit/revenuecat-sdk";

const PROJECT_NAME = "GrocerLens";

const APP_STORE_APP_NAME = "GrocerLens iOS";
const APP_STORE_BUNDLE_ID = "com.grocerlens.app";
const PLAY_STORE_APP_NAME = "GrocerLens Android";
const PLAY_STORE_PACKAGE_NAME = "com.grocerlens.app";

const ENTITLEMENT_IDENTIFIER = "premium";
const ENTITLEMENT_DISPLAY_NAME = "GrocerLens Premium";

const OFFERING_IDENTIFIER = "default";
const OFFERING_DISPLAY_NAME = "Default Offering";

type ProductConfig = {
  identifier: string;
  playStoreIdentifier: string;
  displayName: string;
  userFacingTitle: string;
  duration: string;
  packageIdentifier: string;
  packageDisplayName: string;
  prices: { amount_micros: number; currency: string }[];
};

const PRODUCTS: ProductConfig[] = [
  {
    identifier: "grocerlens_premium_monthly",
    playStoreIdentifier: "grocerlens_premium_monthly:monthly",
    displayName: "GrocerLens Premium Monthly",
    userFacingTitle: "GrocerLens Premium",
    duration: "P1M",
    packageIdentifier: "$rc_monthly",
    packageDisplayName: "Monthly Premium",
    prices: [
      { amount_micros: 1_990_000, currency: "USD" },
    ],
  },
  {
    identifier: "grocerlens_premium_annual",
    playStoreIdentifier: "grocerlens_premium_annual:annual",
    displayName: "GrocerLens Premium Annual",
    userFacingTitle: "GrocerLens Premium Annual",
    duration: "P1Y",
    packageIdentifier: "$rc_annual",
    packageDisplayName: "Annual Premium",
    prices: [
      { amount_micros: 14_990_000, currency: "USD" },
    ],
  },
];

type TestStorePricesResponse = {
  object: string;
  prices: { amount_micros: number; currency: string }[];
};

async function seedRevenueCat() {
  const client = await getUncachableRevenueCatClient();

  let project: Project;
  const { data: existingProjects, error: listProjectsError } = await listProjects({
    client,
    query: { limit: 20 },
  });

  if (listProjectsError) throw new Error("Failed to list projects");

  const existingProject = existingProjects.items?.find((p) => p.name === PROJECT_NAME);

  if (existingProject) {
    console.log("Project already exists:", existingProject.id);
    project = existingProject;
  } else {
    const { data: newProject, error: createProjectError } = await createProject({
      client,
      body: { name: PROJECT_NAME },
    });
    if (createProjectError) throw new Error("Failed to create project");
    console.log("Created project:", newProject.id);
    project = newProject;
  }

  const { data: apps, error: listAppsError } = await listApps({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });

  if (listAppsError || !apps || apps.items.length === 0) {
    throw new Error("No apps found");
  }

  let testStoreApp: App | undefined = apps.items.find((a) => a.type === "test_store");
  let appStoreApp: App | undefined = apps.items.find((a) => a.type === "app_store");
  let playStoreApp: App | undefined = apps.items.find((a) => a.type === "play_store");

  if (!testStoreApp) {
    throw new Error("No test store app found — RevenueCat project was not created correctly");
  } else {
    console.log("Test store app found:", testStoreApp.id);
  }

  if (!appStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: {
        name: APP_STORE_APP_NAME,
        type: "app_store",
        app_store: { bundle_id: APP_STORE_BUNDLE_ID },
      },
    });
    if (error) throw new Error("Failed to create App Store app");
    appStoreApp = newApp;
    console.log("Created App Store app:", appStoreApp.id);
  } else {
    console.log("App Store app found:", appStoreApp.id);
  }

  if (!playStoreApp) {
    const { data: newApp, error } = await createApp({
      client,
      path: { project_id: project.id },
      body: {
        name: PLAY_STORE_APP_NAME,
        type: "play_store",
        play_store: { package_name: PLAY_STORE_PACKAGE_NAME },
      },
    });
    if (error) throw new Error("Failed to create Play Store app");
    playStoreApp = newApp;
    console.log("Created Play Store app:", playStoreApp.id);
  } else {
    console.log("Play Store app found:", playStoreApp.id);
  }

  const { data: existingProducts, error: listProductsError } = await listProducts({
    client,
    path: { project_id: project.id },
    query: { limit: 100 },
  });

  if (listProductsError) throw new Error("Failed to list products");

  const ensureProductForApp = async (
    targetApp: App,
    label: string,
    productIdentifier: string,
    config: ProductConfig,
    isTestStore: boolean
  ): Promise<Product> => {
    const existingProduct = existingProducts.items?.find(
      (p) => p.store_identifier === productIdentifier && p.app_id === targetApp.id
    );

    if (existingProduct) {
      console.log(label + " product already exists:", existingProduct.id);
      return existingProduct;
    }

    const body: CreateProductData["body"] = {
      store_identifier: productIdentifier,
      app_id: targetApp.id,
      type: "subscription",
      display_name: config.displayName,
    };

    if (isTestStore) {
      body.subscription = { duration: config.duration };
      body.title = config.userFacingTitle;
    }

    const { data: createdProduct, error } = await createProduct({
      client,
      path: { project_id: project.id },
      body,
    });

    if (error) throw new Error("Failed to create " + label + " product");
    console.log("Created " + label + " product:", createdProduct.id);
    return createdProduct;
  };

  let entitlement: Entitlement | undefined;
  const { data: existingEntitlements, error: listEntitlementsError } = await listEntitlements({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });

  if (listEntitlementsError) throw new Error("Failed to list entitlements");

  const existingEntitlement = existingEntitlements.items?.find(
    (e) => e.lookup_key === ENTITLEMENT_IDENTIFIER
  );

  if (existingEntitlement) {
    console.log("Entitlement already exists:", existingEntitlement.id);
    entitlement = existingEntitlement;
  } else {
    const { data: newEntitlement, error } = await createEntitlement({
      client,
      path: { project_id: project.id },
      body: {
        lookup_key: ENTITLEMENT_IDENTIFIER,
        display_name: ENTITLEMENT_DISPLAY_NAME,
      },
    });
    if (error) throw new Error("Failed to create entitlement");
    console.log("Created entitlement:", newEntitlement.id);
    entitlement = newEntitlement;
  }

  let offering: Offering | undefined;
  const { data: existingOfferings, error: listOfferingsError } = await listOfferings({
    client,
    path: { project_id: project.id },
    query: { limit: 20 },
  });

  if (listOfferingsError) throw new Error("Failed to list offerings");

  const existingOffering = existingOfferings.items?.find(
    (o) => o.lookup_key === OFFERING_IDENTIFIER
  );

  if (existingOffering) {
    console.log("Offering already exists:", existingOffering.id);
    offering = existingOffering;
  } else {
    const { data: newOffering, error } = await createOffering({
      client,
      path: { project_id: project.id },
      body: {
        lookup_key: OFFERING_IDENTIFIER,
        display_name: OFFERING_DISPLAY_NAME,
      },
    });
    if (error) throw new Error("Failed to create offering");
    console.log("Created offering:", newOffering.id);
    offering = newOffering;
  }

  if (!offering.is_current) {
    const { error } = await updateOffering({
      client,
      path: { project_id: project.id, offering_id: offering.id },
      body: { is_current: true },
    });
    if (error) throw new Error("Failed to set offering as current");
    console.log("Set offering as current");
  }

  const allProductIds: string[] = [];

  for (const productConfig of PRODUCTS) {
    const testStoreProduct = await ensureProductForApp(
      testStoreApp, "Test Store (" + productConfig.displayName + ")",
      productConfig.identifier, productConfig, true
    );
    const appStoreProduct = await ensureProductForApp(
      appStoreApp, "App Store (" + productConfig.displayName + ")",
      productConfig.identifier, productConfig, false
    );
    const playStoreProduct = await ensureProductForApp(
      playStoreApp, "Play Store (" + productConfig.displayName + ")",
      productConfig.playStoreIdentifier, productConfig, false
    );

    console.log("Adding test store prices for:", productConfig.displayName);
    const { error: priceError } = await client.post<TestStorePricesResponse>({
      url: "/projects/{project_id}/products/{product_id}/test_store_prices",
      path: { project_id: project.id, product_id: testStoreProduct.id },
      body: { prices: productConfig.prices },
    });

    if (priceError) {
      if (typeof priceError === "object" && "type" in priceError && priceError["type"] === "resource_already_exists") {
        console.log("Test store prices already exist for:", productConfig.displayName);
      } else {
        throw new Error("Failed to add test store prices for " + productConfig.displayName);
      }
    } else {
      console.log("Added test store prices for:", productConfig.displayName);
    }

    allProductIds.push(testStoreProduct.id, appStoreProduct.id, playStoreProduct.id);

    const { data: existingPackagesList, error: listPackagesError } = await listPackages({
      client,
      path: { project_id: project.id, offering_id: offering.id },
      query: { limit: 20 },
    });

    if (listPackagesError) throw new Error("Failed to list packages");

    let pkg: Package | undefined;
    const existingPackage = existingPackagesList.items?.find(
      (p) => p.lookup_key === productConfig.packageIdentifier
    );

    if (existingPackage) {
      console.log("Package already exists:", existingPackage.id, productConfig.packageIdentifier);
      pkg = existingPackage;
    } else {
      const { data: newPackage, error } = await createPackages({
        client,
        path: { project_id: project.id, offering_id: offering.id },
        body: {
          lookup_key: productConfig.packageIdentifier,
          display_name: productConfig.packageDisplayName,
        },
      });
      if (error) throw new Error("Failed to create package: " + productConfig.packageIdentifier);
      console.log("Created package:", newPackage.id, productConfig.packageIdentifier);
      pkg = newPackage;
    }

    const { error: attachPackageError } = await attachProductsToPackage({
      client,
      path: { project_id: project.id, package_id: pkg.id },
      body: {
        products: [
          { product_id: testStoreProduct.id, eligibility_criteria: "all" },
          { product_id: appStoreProduct.id, eligibility_criteria: "all" },
          { product_id: playStoreProduct.id, eligibility_criteria: "all" },
        ],
      },
    });

    if (attachPackageError) {
      if (
        attachPackageError.type === "unprocessable_entity_error" &&
        attachPackageError.message?.includes("Cannot attach product")
      ) {
        console.log("Skipping package attach: already has incompatible product");
      } else {
        throw new Error("Failed to attach products to package: " + productConfig.packageIdentifier);
      }
    } else {
      console.log("Attached products to package:", productConfig.packageIdentifier);
    }
  }

  const { error: attachEntitlementError } = await attachProductsToEntitlement({
    client,
    path: { project_id: project.id, entitlement_id: entitlement.id },
    body: { product_ids: allProductIds },
  });

  if (attachEntitlementError) {
    if (attachEntitlementError.type === "unprocessable_entity_error") {
      console.log("Products already attached to entitlement");
    } else {
      throw new Error("Failed to attach products to entitlement");
    }
  } else {
    console.log("Attached all products to entitlement");
  }

  const { data: testStoreApiKeys, error: testKeysErr } = await listAppPublicApiKeys({
    client,
    path: { project_id: project.id, app_id: testStoreApp.id },
  });
  if (testKeysErr) throw new Error("Failed to list test store API keys");

  const { data: appStoreApiKeys, error: appStoreKeysErr } = await listAppPublicApiKeys({
    client,
    path: { project_id: project.id, app_id: appStoreApp.id },
  });
  if (appStoreKeysErr) throw new Error("Failed to list App Store API keys");

  const { data: playStoreApiKeys, error: playStoreKeysErr } = await listAppPublicApiKeys({
    client,
    path: { project_id: project.id, app_id: playStoreApp.id },
  });
  if (playStoreKeysErr) throw new Error("Failed to list Play Store API keys");

  console.log("\n====================");
  console.log("RevenueCat setup complete!");
  console.log("Project ID:", project.id);
  console.log("Test Store App ID:", testStoreApp.id);
  console.log("App Store App ID:", appStoreApp.id);
  console.log("Play Store App ID:", playStoreApp.id);
  console.log("Entitlement Identifier:", ENTITLEMENT_IDENTIFIER);
  console.log("Public API Keys - Test Store:", testStoreApiKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("Public API Keys - App Store:", appStoreApiKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("Public API Keys - Play Store:", playStoreApiKeys?.items.map((k) => k.key).join(", ") ?? "N/A");
  console.log("====================\n");
}

seedRevenueCat().catch(console.error);
