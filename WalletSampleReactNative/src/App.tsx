/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';

import { Utils } from './Utils';
import { Constants } from './Constants';
import vcl, {
  VCLCountries,
  VCLCountryCodes,
  VCLCredentialManifest,
  VCLCredentialManifestDescriptorByDeepLink,
  VCLCredentialManifestDescriptorByService,
  VCLCredentialManifestDescriptorRefresh,
  VCLCredentialType,
  VCLCredentialTypeSchemas,
  VCLCredentialTypesUIFormSchema,
  VCLCredentialTypesUIFormSchemaDescriptor,
  VCLEnvironment,
  VCLEnvTypes,
  VCLError,
  VCLExchange,
  VCLExchangeDescriptor,
  VCLFinalizeOffersDescriptor,
  VCLGenerateOffersDescriptor,
  VCLJWT,
  VCLJwtVerifiableCredentials,
  VCLOffers,
  VCLOrganizations,
  VCLPresentationRequest,
  VCLPresentationSubmission,
  VCLPresentationSubmissionResult,
  VCLService,
  VCLServiceCredentialAgentIssuer,
  VCLToken,
  VCLVerifiedProfile,
  VCLDeepLink,
} from '@velocitycareerlabs/vcl-react-native';

export const enum InitState {
  Initializing,
  InitializationSucceed,
  InitializationFailed,
}

const environment: VCLEnvironment = {
  value: VCLEnvTypes.DEV,
};

export default function App() {
  const [initState, setInitState] = React.useState<InitState>(
    InitState.Initializing
  );
  const [error, setError] = React.useState<VCLError>();

  React.useEffect(() => {
    setInitState(InitState.Initializing);
    vcl.initialize(environment).then(
      () => {
        console.log('VCL Initialized');
        setInitState(InitState.InitializationSucceed);
      },
      (err: VCLError) => {
        setInitState(InitState.InitializationFailed);
        setError(err);
        console.log('VCL Initialization error:', err);
      }
    );
  }, []);

  const getCountries = () => {
    vcl.getCountries().then(
      (countries: VCLCountries) => {
        console.log('VCL Countries received:', countries);
      },
      (err: VCLError) => {
        console.log('VCL getCountries Error:', err);
      }
    );
  };

  const getCredentialTypeSchemas = () => {
    vcl.getCredentialTypeSchemas().then(
      (credentialTypesScemas: VCLCredentialTypeSchemas) => {
        console.log(
          'VCL Credential type schemas received:',
          credentialTypesScemas
        );
      },
      (err: VCLError) => {
        console.log('VCL getCredentialTypeSchemas Error:', err);
      }
    );
  };

  const getCredentialTypes = () => {
    vcl.getCredentialTypes().then(
      (credentialTypes: VCLCredentialType[]) => {
        console.log('VCL Credential Types received:', credentialTypes);
      },
      (err: VCLError) => {
        console.log('VCL getCredentialTypeSchemas Error:', err);
      }
    );
  };

  const getPresentationRequest = () => {
    var deepLink: VCLDeepLink = {
      value: Constants.PresentationRequestDeepLinkStrDev,
    };
    if (environment.value === VCLEnvTypes.STAGING) {
      deepLink = {
        value: Constants.PresentationRequestDeepLinkStrStaging,
      };
    }
    vcl.getPresentationRequest(deepLink).then(
      (presentationRequest: VCLPresentationRequest) => {
        console.log('VCL Presentation Request received:', presentationRequest);
        submitPresentation(presentationRequest);
      },
      (err: VCLError) => {
        console.log('VCL Presentation Request failed:', err);
      }
    );
  };

  const submitPresentation = (presentationRequest: VCLPresentationRequest) => {
    const presentationSubmission: VCLPresentationSubmission = {
      presentationRequest: presentationRequest,
      verifiableCredentials: Constants.PresentationSelectionsList,
    };

    vcl.submitPresentation(presentationSubmission).then(
      (presentationSubmissionResult: VCLPresentationSubmissionResult) => {
        console.log(
          'VCL Presentation submission result:',
          presentationSubmissionResult
        );

        const exchangeDescriptor: VCLExchangeDescriptor = {
          presentationSubmission: presentationSubmission,
          submissionResult: presentationSubmissionResult,
        };

        vcl.getExchangeProgress(exchangeDescriptor).then(
          (exchange: VCLExchange) => {
            console.log('VCL Presentation submission progress:', exchange);
          },
          (err: VCLError) => {
            console.log('VCL Presentation submission progress failed:', err);
          }
        );
      },
      (err: VCLError) => {
        console.log('VCL Presentation submission failed:', err);
      }
    );
  };

  const getOrganizationsThenCredentialManifestByService = () => {
    searchForOrganizations();
  };

  const searchForOrganizations = () => {
    vcl
      .searchForOrganizations(Constants.OrganizationsSearchDescriptorByDid)
      .then(
        (organizations: VCLOrganizations) => {
          console.log('VCL Organizations received:', organizations);

          let serviceCredentialAgentIssuer: VCLServiceCredentialAgentIssuer = {
            payload:
              organizations.all[0].serviceCredentialAgentIssuers[0].payload,
          };
          getCredentialManifestByService(serviceCredentialAgentIssuer);
        },
        (err: VCLError) => {
          console.log('VCL Organizations search failed: ', err);
        }
      );
  };

  const getCredentialManifestByService = (
    serviceCredentialAgentIssuer: VCLServiceCredentialAgentIssuer
  ) => {
    let credentialManifestDescriptorByOrganization: VCLCredentialManifestDescriptorByService =
      {
        service: serviceCredentialAgentIssuer,
        credentialTypes: [
          'CertificationV1.0',
          'EducationDegreeStudyV1.0',
          'EducationDegreeRegistrationV1.0',
        ],
      };
    vcl.getCredentialManifest(credentialManifestDescriptorByOrganization).then(
      (credentialManifest: VCLCredentialManifest) => {
        generateOffers(credentialManifest);
      },
      (err: VCLError) => {
        console.log('VCL Credential Manifest failed:', err);
      }
    );
  };

  const getCredentialManifestByDeepLink = () => {
    let credentialManifestDescriptorByDeepLink: VCLCredentialManifestDescriptorByDeepLink =
      {
        deepLink: { value: Constants.CredentialManifestDeepLinkStrDev },
      };
    vcl.getCredentialManifest(credentialManifestDescriptorByDeepLink).then(
      (credentialManifest: VCLCredentialManifest) => {
        console.log('VCL Credential Manifest received:', credentialManifest);
        generateOffers(credentialManifest);
      },
      (err: VCLError) => {
        console.log('VCL Credential Manifest failed:', err);
      }
    );
  };

  const refreshCredentials = () => {
    let service: VCLService = {
      payload: JSON.parse(Constants.IssuingServiceJsonStr),
    };
    let credentialManifestDescriptorRefresh: VCLCredentialManifestDescriptorRefresh =
      {
        service: service,
        credentialIds: Constants.CredentialIds,
      };
    vcl.getCredentialManifest(credentialManifestDescriptorRefresh).then(
      (credentialManifest: VCLCredentialManifest) => {
        console.log(
          `VCL Credentials refreshed, credential manifest: ${credentialManifest.jwt.encodedJwt}`
        );
      },
      (err: VCLError) => {
        console.log('VCL Refresh Credentials failed:', err);
      }
    );
  };

  const generateOffers = (credentialManifest: VCLCredentialManifest) => {
    let generateOffersDescriptor: VCLGenerateOffersDescriptor = {
      credentialManifest: credentialManifest,
      types: Constants.CredentialTypes,
      identificationVerifiableCredentials: Constants.IdentificationList,
    };

    vcl.generateOffers(generateOffersDescriptor).then(
      (offers: VCLOffers) => {
        console.log(`VCL Generated Offers: ${offers.all}`);
        console.log(
          `VCL Generated Offers Response Code: ${offers.responseCode}`
        );
        console.log(`VCL Generated Offers Token: ${offers.token}`);

        // Check offers invoked after the push notification is notified the app that offers are ready:
        checkForOffers(
          credentialManifest,
          generateOffersDescriptor,
          offers.token
        );
      },
      (err: VCLError) => {
        console.log('VCL generateOffers Error:', err);
      }
    );
  };

  const checkForOffers = (
    credentialManifest: VCLCredentialManifest,
    generateOffersDescriptor: VCLGenerateOffersDescriptor,
    token: VCLToken
  ) => {
    vcl.checkForOffers(generateOffersDescriptor, token).then(
      (offers: VCLOffers) => {
        console.log(`VCL Checked Offers: ${offers.all}`);
        console.log(`VCL Checked Offers Response Code: ${offers.responseCode}`);
        console.log(`VCL Checked Offers Token: ${offers.token}`);
        if (offers.responseCode === 200) {
          finalizeOffers(credentialManifest, offers);
        }
      },
      (err: VCLError) => {
        console.log(`VCL failed to Check Offers: ${err}`);
      }
    );
  };

  const finalizeOffers = (
    credentialManifest: VCLCredentialManifest,
    generatedOffers: VCLOffers
  ) => {
    let approvedRejectedOfferIds =
      Utils.getApprovedRejectedOfferIdsMock(generatedOffers);
    let finalizeOffersDescriptor: VCLFinalizeOffersDescriptor = {
      credentialManifest: credentialManifest,
      approvedOfferIds: approvedRejectedOfferIds[0],
      rejectedOfferIds: approvedRejectedOfferIds[1],
    };
    vcl.finalizeOffers(finalizeOffersDescriptor, generatedOffers.token).then(
      (jwtVerifiableCredentials: VCLJwtVerifiableCredentials) => {
        console.log('VCL Finalized Offers received:', jwtVerifiableCredentials);
      },
      (err: VCLError) => {
        console.log('VCL finalizeOffers Error:', err);
      }
    );
  };

  const getCredentialTypesUIFormSchema = () => {
    let credentialTypesUIFormSchemaDescriptor: VCLCredentialTypesUIFormSchemaDescriptor =
      {
        credentialType: Constants.ResidentPermitV10,
        countryCode: VCLCountryCodes.CA,
      };
    vcl
      .getCredentialTypesUIFormSchema(credentialTypesUIFormSchemaDescriptor)
      .then(
        (credentialTypesUIFormSchema: VCLCredentialTypesUIFormSchema) => {
          console.log(
            'VCL Credential Types UI Form Schema received:',
            credentialTypesUIFormSchema
          );
        },
        (err: VCLError) => {
          console.log('VCL getCredentialTypesFormSchema Error:', err);
        }
      );
  };

  const getVerifiedProfile = () => {
    vcl.getVerifiedProfile(Constants.VerifiedProfileDescriptor).then(
      (verifiedProfile: VCLVerifiedProfile) => {
        console.log('VCL Verified Profile: ', verifiedProfile.payload);
      },
      (err: VCLError) => {
        console.log('VCL Verified Profile failed:', err);
      }
    );
  };

  const verifyJwt = () => {
    vcl.verifyJwt(Constants.SomeJwt, Constants.SomePublicKey).then(
      (isVerified: boolean) => {
        console.log('VCL verified jwt:', isVerified);
      },
      (err: VCLError) => {
        console.log('VCL verify Error:', err);
      }
    );
  };

  const generateSignedJwt = () => {
    vcl.generateSignedJwt(Constants.SomeJson, Constants.SomeIss).then(
      (jwt: VCLJWT) => {
        console.log('VCL generated signed jwt:', jwt);
      },
      (err: VCLError) => {
        console.log('VCL sign Error:', err);
      }
    );
  };

  if (initState === InitState.InitializationSucceed) {
    return (
      <View style={styles.container}>
        <View style={styles.space} />
        <Button title="getCountries" onPress={getCountries} />
        <View style={styles.space} />
        <Button title="getCredentialTypes" onPress={getCredentialTypes} />
        <View style={styles.space} />
        <Button
          title="getCredentialTypeSchemas"
          onPress={getCredentialTypeSchemas}
        />
        <View style={styles.space} />
        <Button
          title="Disclosing Credentials (aka Inspection)"
          onPress={getPresentationRequest}
        />
        <View style={styles.space} />
        <Button
          title="Receiving Credentials (aka Issuing) By Deeplink"
          onPress={getCredentialManifestByDeepLink}
        />
        <View style={styles.space} />
        <Button
          title="Receiving Credentials (aka Issuing) By Services"
          onPress={getOrganizationsThenCredentialManifestByService}
        />
        <View style={styles.space} />
        <Button
          title="Self Reporting Credentials (aka Self Attested)"
          onPress={getCredentialTypesUIFormSchema}
        />
        <View style={styles.space} />
        <Button title="Refresh Credentials" onPress={refreshCredentials} />
        <View style={styles.space} />
        <Button title="Get Verified Profile" onPress={getVerifiedProfile} />
        <View style={styles.space} />
        <Button title="Verify Jwt" onPress={verifyJwt} />
        <View style={styles.space} />
        <Button title="Generate Signed Jwt" onPress={generateSignedJwt} />
      </View>
    );
  } else if (initState === InitState.InitializationFailed) {
    return (
      <View style={styles.container}>
        <Text>Initialization Failed</Text>
        <Text>{error?.description}</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Text>Initializing...</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  space: {
    width: 5, // or whatever size you need
    height: 5,
  },
});
