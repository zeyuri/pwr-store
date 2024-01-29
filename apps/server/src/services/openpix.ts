import {
  AbstractPaymentProcessor,
  PaymentProcessorContext,
  PaymentProcessorError,
  PaymentProcessorSessionResponse,
  PaymentSessionStatus,
} from "@medusajs/medusa";

const openPixBasePatch = "https://api.openpix.com.br";
const charge = "/api/v1/charge";
const getUrl = () => `${openPixBasePatch}${charge}`;
const appId = process.env.OPENPIX_APP_ID || "";
const getAuthorization = () => appId;
export type ChargePostResponse = {
  chargeID: string;
  correlationID: string;
  brCode: string;
};

export type Customer = {
  name: string;
  taxID: string;
  email: string;
  phone: string;
};
export type ChargePostPayload = {
  correlationID: string;
  value: number;
  comment?: string;
  customer?: Customer;
  error?: string;
};

export const chargePost = async (
  payload: ChargePostPayload,
): Promise<ChargePostResponse> => {
  const response = await fetch(getUrl(), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: appId,
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const data = await response.json();

    return data;
  }

  const data = await response.json();

  console.log({
    data,
  });

  return data;
};
const getCharge = async (id: string) =>
  await fetch(`${openPixBasePatch}${charge}/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: getAuthorization(),
    },
  }).then((res) => res.json());

class OpenPixPaymentService extends AbstractPaymentProcessor {
  static identifier = "openpix";

  constructor(container, options) {
    super(container);
  }

  capturePayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    throw new Error("Method not implemented.");
  }
  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>,
  ): Promise<
    | PaymentProcessorError
    | { status: PaymentSessionStatus; data: Record<string, unknown> }
  > {
    const correlationID =
      paymentSessionData.charge["correlationID"] ||
      paymentSessionData["correlationID"];
    const response = await getCharge(correlationID);
    const { status } = response.charge as Charge;
    console.log("🚀 ~ OpenPixPaymentService ~ status: 98", status);
    return {
      ...paymentSessionData,
      status:
        status === "COMPLETED"
          ? PaymentSessionStatus.AUTHORIZED
          : PaymentSessionStatus.PENDING,
      data: paymentSessionData.data as Record<string, unknown>,
    };
  }
  cancelPayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    throw new Error("Method not implemented.");
  }
  initiatePayment(
    context: PaymentProcessorContext,
  ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
    return Promise.resolve({
      session_data: { status: PaymentSessionStatus.REQUIRES_MORE },
    });
  }
  deletePayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    console.log(
      "🚀 ~ OpenPixPaymentService ~ paymentSessionData:",
      paymentSessionData,
    );
    return Promise.resolve({
      session_data: { status: PaymentSessionStatus.CANCELED },
    });
  }
  async getPaymentStatus(
    paymentSessionData: Charge,
  ): Promise<PaymentSessionStatus> {
    return paymentSessionData.status === "COMPLETED"
      ? PaymentSessionStatus.AUTHORIZED
      : PaymentSessionStatus.PENDING;
  }
  refundPayment(
    paymentSessionData: Record<string, unknown>,
    refundAmount: number,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    throw new Error("Method not implemented.");
  }
  async retrievePayment(
    paymentSessionData: Record<string, unknown>,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    const correlationID =
      paymentSessionData.charge["correlationID"] ||
      paymentSessionData["correlationID"];
    const response = await getCharge(correlationID);
    return response.charge;
  }
  async updatePayment(
    context: PaymentProcessorContext,
  ): Promise<void | PaymentProcessorError | PaymentProcessorSessionResponse> {
    return;
  }
  updatePaymentData(
    sessionId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    return Promise.resolve({ ...data });
  }
  // methods here...
}

export default OpenPixPaymentService;

type Charge = {
  status: "ACTIVE" | "EXPIRED" | "COMPLETED";
  customer: Record<string, unknown>;
  value: number;
  comment?: string;
  correlationID: string;
  paymentLinkID: string;
  paymentLinkUrl: string;
  globalID: string;
  qrCodeImage: string;
  brCode: string;
  additionalInfo?: any[];
  expiresIn: number;
  expiresDate: string;
  createdAt: string;
  updatedAt: string;
};
