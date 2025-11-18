# Demo Data Reference

This document provides a quick reference for all demo data seeded in the database.

## Running the Seed Script

```bash
npm run seed:demo
```

**⚠️ Warning**: This will **CLEAR ALL EXISTING DATA** and populate fresh demo data.

## Demo Credentials

**Password for all users**: `Demo123!`

You can login with any email listed below using this password.

## Companies

| ID  | Name     | Logo URL                                                    |
| --- | -------- | ----------------------------------------------------------- |
| 1   | Efsora   | https://via.placeholder.com/150/0000FF/FFFFFF?text=Efsora   |
| 2   | AllSober | https://via.placeholder.com/150/00FF00/FFFFFF?text=AllSober |
| 3   | TechCorp | https://via.placeholder.com/150/FF0000/FFFFFF?text=TechCorp |

## Roles

| ID  | Name       |
| --- | ---------- |
| 1   | MANAGEMENT |
| 2   | PRODUCT    |
| 3   | LEGAL      |
| 4   | FINANCE    |
| 5   | DEV        |
| 6   | QA         |
| 7   | AI         |
| 8   | DESIGN     |
| 9   | MARKETING  |

## Progress Statuses

| ID  | Name            |
| --- | --------------- |
| 1   | SCHEDULED       |
| 2   | IN_PROGRESS     |
| 3   | WAITING         |
| 4   | INTERNAL_REVIEW |
| 5   | DELIVERED       |
| 6   | COMPLETED       |
| 7   | REVISION        |
| 8   | BLOCKED         |

## Projects

| ID  | Name                     | Company  | Status      |
| --- | ------------------------ | -------- | ----------- |
| 1   | All Sober Mobile         | AllSober | WAITING     |
| 2   | Efsora Internal Platform | Efsora   | IN_PROGRESS |
| 3   | TechCorp Dashboard       | TechCorp | SCHEDULED   |

## Users

### Efsora Team (Company 1) - All Sober Mobile Project

| Name             | Email                       | Role       | Bio                                                    |
| ---------------- | --------------------------- | ---------- | ------------------------------------------------------ |
| Alper Gayretoğlu | alper.gayretoglu@efsora.com | DEV        | Full-Stack Developer specializing in React and Node.js |
| Emre Yildiz      | emre.yildiz@efsora.com      | DEV        | Full-Stack Developer with expertise in TypeScript      |
| Ceren Çınar      | ceren.cinar@efsora.com      | DEV        | Full-Stack Developer focused on scalable architectures |
| Ibrahim Acar     | ibrahim.acar@efsora.com     | DEV        | Full-Stack Developer passionate about clean code       |
| Dilay Ozturk     | dilay.ozturk@efsora.com     | AI         | AI Developer specializing in machine learning models   |
| Ayşe Kaya        | ayse.kaya@efsora.com        | MANAGEMENT | Project Manager with 10+ years experience              |
| Mehmet Demir     | mehmet.demir@efsora.com     | PRODUCT    | Product Owner focused on user experience               |
| Zeynep Şahin     | zeynep.sahin@efsora.com     | DESIGN     | UI/UX Designer creating beautiful interfaces           |

### AllSober Team (Company 2) - All Sober Mobile Project

| Name            | Email                        | Role       | Bio                                            |
| --------------- | ---------------------------- | ---------- | ---------------------------------------------- |
| James Anderson  | james.anderson@allsober.com  | DEV        | Full-Stack Developer with mobile app expertise |
| Sophia Martinez | sophia.martinez@allsober.com | QA         | QA Engineer ensuring product quality           |
| Liam Walker     | liam.walker@allsober.com     | FINANCE    | Finance Specialist managing budgets            |
| Emma Thompson   | emma.thompson@allsober.com   | PRODUCT    | Product Manager driving product vision         |
| Noah Reed       | noah.reed@allsober.com       | LEGAL      | Legal Consultant ensuring compliance           |
| Olivia Harris   | olivia.harris@allsober.com   | MANAGEMENT | CEO and Co-Founder of AllSober                 |
| Ethan Clark     | ethan.clark@allsober.com     | MARKETING  | Marketing Director driving growth              |

### Efsora Team (Company 1) - Internal Platform Project

| Name         | Email                   | Role | Bio                                             |
| ------------ | ----------------------- | ---- | ----------------------------------------------- |
| Burak Yılmaz | burak.yilmaz@efsora.com | DEV  | Backend Developer specializing in microservices |
| Elif Arslan  | elif.arslan@efsora.com  | QA   | QA Lead ensuring code quality                   |

### TechCorp Team (Company 3) - Dashboard Project

| Name            | Email                        | Role    | Bio                       |
| --------------- | ---------------------------- | ------- | ------------------------- |
| Michael Johnson | michael.johnson@techcorp.com | DEV     | Senior Frontend Developer |
| Sarah Davis     | sarah.davis@techcorp.com     | PRODUCT | Product Manager           |

## Testing the "Your Team" Endpoint

### Example API Request

**Endpoint**: `GET /api/v1/projects/team?projectId=1`

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**How to get a token**:

1. Login with any user email and password `Demo123!`
2. Use the returned token for subsequent requests

### Expected Response for Project 1 (All Sober Mobile)

**Login as any AllSober user** (e.g., `emma.thompson@allsober.com`):

```json
{
  "success": true,
  "data": {
    "customerTeam": [
      // 7 AllSober team members with full ExtendedUserData
      {
        "id": "uuid",
        "email": "james.anderson@allsober.com",
        "name": "James",
        "surname": "Anderson",
        "bio": "Full-Stack Developer with mobile app expertise",
        "companyId": 2,
        "roleId": 5,
        "projectId": 1,
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      }
      // ... 6 more AllSober team members
    ],
    "efsoraTeam": [
      // 8 Efsora team members with full ExtendedUserData
      {
        "id": "uuid",
        "email": "alper.gayretoglu@efsora.com",
        "name": "Alper",
        "surname": "Gayretoğlu",
        "bio": "Full-Stack Developer specializing in React and Node.js",
        "companyId": 1,
        "roleId": 5,
        "projectId": 1,
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      }
      // ... 7 more Efsora team members
    ]
  },
  "traceId": "...",
  "error": null,
  "message": null,
  "meta": null
}
```

## Milestones (Project 1)

| Title                   | Assignee         | Status      | Due Date   |
| ----------------------- | ---------------- | ----------- | ---------- |
| MVP Release             | Emma Thompson    | IN_PROGRESS | 2025-03-01 |
| User Authentication     | Alper Gayretoğlu | COMPLETED   | 2025-01-15 |
| Payment Integration     | James Anderson   | IN_PROGRESS | 2025-02-15 |
| Legal Compliance Review | Noah Reed        | WAITING     | 2025-02-28 |

## Events (Project 1)

| Title                | Owner            | Date             | Status    |
| -------------------- | ---------------- | ---------------- | --------- |
| Sprint Planning      | Emma Thompson    | 2025-01-20 10:00 | SCHEDULED |
| Architecture Review  | Alper Gayretoğlu | 2025-01-22 14:00 | SCHEDULED |
| User Testing Session | Sophia Martinez  | 2025-02-01 13:00 | SCHEDULED |
| Stakeholder Demo     | Olivia Harris    | 2025-02-10 15:00 | SCHEDULED |

## Quick Test Commands

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emma.thompson@allsober.com","password":"Demo123!"}'

# Get Your Team (replace <token> with JWT from login)
curl -X GET "http://localhost:3000/api/v1/projects/team?projectId=1" \
  -H "Authorization: Bearer <token>"
```

## Frontend Integration Tips

1. **Display Role Names**: Frontend should map `roleId` to role names using the roles lookup
2. **Team Avatars**: Use `name` and `surname` initials for avatar placeholders
3. **Bio Tooltips**: Show `bio` on hover for team member cards
4. **Company Badge**: Use `companyId` to display company badges/colors
5. **Timestamps**: Format `createdAt`/`updatedAt` for "Member since" badges

## Data Characteristics

- **Diverse Roles**: Team has management, dev, QA, legal, finance, product, AI, design, and marketing
- **Turkish Names**: Efsora team has authentic Turkish names with proper characters (ı, ş, ğ, ö, ü, ç)
- **Realistic Bios**: Each user has a professional bio describing their expertise
- **Multiple Projects**: Data includes 3 projects across 3 companies
- **Complete Workflow**: Includes milestones and events for realistic project context
