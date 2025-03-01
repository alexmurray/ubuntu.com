import React, { useState, createContext, useEffect } from "react";
import {
  getProduct,
  ProductTypes,
  LTSVersions,
  Support,
  Product,
  Features,
  Periods,
  SLA,
  isMonthlyAvailable,
} from "./utils";

interface FormContext {
  productType: ProductTypes;
  setProductType: React.Dispatch<React.SetStateAction<ProductTypes>>;
  version: LTSVersions;
  setVersion: React.Dispatch<React.SetStateAction<LTSVersions>>;
  feature: Features;
  setFeature: React.Dispatch<React.SetStateAction<Features>>;
  support: Support;
  setSLA: React.Dispatch<React.SetStateAction<SLA>>;
  sla: SLA;
  setSupport: React.Dispatch<React.SetStateAction<Support>>;
  quantity: number | string;
  setQuantity: React.Dispatch<React.SetStateAction<number | string>>;
  product: Product | null;
  period: Periods;
  setPeriod: React.Dispatch<React.SetStateAction<Periods>>;
}

export const defaultValues: FormContext = {
  productType: ProductTypes.physical,
  setProductType: () => {},
  version: LTSVersions.jammy,
  setVersion: () => {},
  feature: Features.pro,
  setFeature: () => {},
  sla: SLA.none,
  setSLA: () => {},
  support: Support.none,
  setSupport: () => {},
  quantity: 1,
  setQuantity: () => {},
  period: Periods.yearly,
  setPeriod: () => {},
  product: null,
};

export const FormContext = createContext<FormContext>(defaultValues);

interface FormProviderProps {
  initialType?: ProductTypes;
  initialVersion?: LTSVersions;
  initialFeature?: Features;
  initialSLA?: SLA;
  initialSupport?: Support;
  initialQuantity?: number | string;
  initialPeriod?: Periods;
  children: React.ReactNode;
}

export const FormProvider = ({
  initialType = defaultValues.productType,
  initialVersion = defaultValues.version,
  initialFeature = defaultValues.feature,
  initialSLA = defaultValues.sla,
  initialSupport = defaultValues.support,
  initialQuantity = defaultValues.quantity,
  initialPeriod = defaultValues.period,
  children,
}: FormProviderProps) => {
  const [productType, setProductType] = useState<ProductTypes>(initialType);
  const [version, setVersion] = useState<LTSVersions>(initialVersion);
  const [feature, setFeature] = useState<Features>(initialFeature);
  const [sla, setSLA] = useState<SLA>(initialSLA);
  const [support, setSupport] = useState<Support>(initialSupport);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [period, setPeriod] = useState<Periods>(initialPeriod);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (support === Support.none) {
      setSLA(SLA.none);
    }
    if (support !== Support.none && sla === SLA.none) {
      setSLA(SLA.weekday);
    }
  }, [support, sla]);

  useEffect(() => {
    if (version === LTSVersions.trusty || version === LTSVersions.xenial) {
      if (support !== Support.none) {
        setSupport(Support.infra);
      }
    }
  }, [version, support]);

  useEffect(() => {
    if (feature === Features.infra) {
      if (support === Support.full) {
        setSupport(Support.none);
      }
    }
  }, [feature, support]);

  useEffect(() => {
    if (productType === ProductTypes.desktop) {
      if (support === Support.infra) {
        setSupport(Support.none);
      }
    }
  }, [productType, support]);

  useEffect(() => {
    if (productType === ProductTypes.desktop) {
      setFeature(Features.pro);
    }
  }, [productType, feature]);

  useEffect(() => {
    const product = getProduct(productType, feature, support, sla, period);
    setProduct(window.productList[product] ?? null);
  }, [feature, productType, sla, support, period]);

  useEffect(() => {
    if (!isMonthlyAvailable(product)) {
      setPeriod(Periods.yearly);
    }
  }, [product]);

  return (
    <FormContext.Provider
      value={{
        productType,
        setProductType,
        version,
        setVersion,
        feature,
        setFeature,
        sla,
        setSLA,
        support,
        setSupport,
        quantity,
        setQuantity,
        period,
        setPeriod,
        product,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
