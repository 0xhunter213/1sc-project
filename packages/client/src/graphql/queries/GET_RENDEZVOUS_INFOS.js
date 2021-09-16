import { gql } from '@apollo/client'

const GET_STUDENT_ALL_INFOS = gql`
  query MyQuery {
    allUserAccounts(condition: { role: ETUDIANT }) {
      nodes {
        id
        email
        nom
        prenom
      }
    }
  }
`
const GET_LES_NIVEAU_DE_LECOLE = gql`
  query MyQuery {
    allEcoleNiveaus {
      nodes {
        niveau
        totalGroupes
        description
      }
    }
  }
`
const GET_EMAILS_PAR_ANNEE_GROUPE = gql`
  query MyQuery($niveau: Int!, $groupe: Int!) {
    allUserAccounts(
      condition: { role: ETUDIANT, niveau: $niveau, groupe: $groupe }
    ) {
      nodes {
        id
        email
        nom
        prenom
      }
    }
  }
`

export {
  GET_STUDENT_ALL_INFOS,
  GET_LES_NIVEAU_DE_LECOLE,
  GET_EMAILS_PAR_ANNEE_GROUPE
}
