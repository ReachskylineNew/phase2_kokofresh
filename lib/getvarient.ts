// lib/getVariant.ts
export function getVariant(product: any, choices: Record<string, string>) {
  if (!product?.variants) return null;

  return product.variants.find((variant: any) =>
    Object.entries(choices).every(
      ([name, value]) => variant.choices?.[name] === value
    )
  );
}
