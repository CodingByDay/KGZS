# Domain Model - Food Evaluation System

## Entities

### User
**Purpose**: Represents all system users with authentication and authorization.

**Key Fields**:
- `Id` (unique identifier)
- `Email` (unique, required)
- `EmailVerified` (boolean)
- `PhoneNumber` (optional)
- `PhoneNumberVerified` (boolean)
- `PasswordHash` (required)
- `FirstName`
- `LastName`
- `CreatedAt`
- `LastLoginAt`
- `IsActive` (boolean)

**Roles**: Administrator, Organizer, CommissionChair, CommissionMember, CommissionTrainee, Applicant, Consumer

---

### Event
**Purpose**: Represents a single or periodic food evaluation session.

**Key Fields**:
- `Id` (unique identifier)
- `Name`
- `Description`
- `StartDate`
- `EndDate`
- `Status` (Draft, Active, Completed, Archived)
- `CreatedAt`
- `CreatedBy` (User reference)
- `PaymentRequired` (boolean)
- `AllowConsumerEvaluation` (boolean)

**Relationships**:
- Has many Applicants
- Has many ProductSamples
- Has many Commissions
- Has many Categories
- Has many EvaluationCriteria
- Has many Records
- Has one ScoringPolicy
- Can be copied from another Event

---

### Category
**Purpose**: Represents a food category or group within an event.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event)
- `Name`
- `Description`
- `DisplayOrder` (for sorting)
- `CreatedAt`

**Relationships**:
- Belongs to one Event
- Has many ProductSamples
- Has many Commissions (one commission per category)

---

### Applicant
**Purpose**: Represents a participant who submits food samples for evaluation.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event)
- `UserId` (foreign key to User, nullable - can be registered or guest)
- `CompanyName` (optional)
- `ContactPersonName`
- `Email` (required, must be verified)
- `PhoneNumber` (required, must be verified via SMS)
- `Address`
- `Region` (for analytics)
- `Status` (Draft, Submitted, PaymentPending, PaymentConfirmed, Rejected)
- `RegistrationDate`
- `PaymentConfirmedAt` (nullable)

**Relationships**:
- Belongs to one Event
- Optionally linked to one User account
- Has many ProductSamples
- Has many Payments
- Receives many Records

---

### Payment
**Purpose**: Represents payment for event participation.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event)
- `ApplicantId` (foreign key to Applicant)
- `Amount`
- `Currency`
- `PaymentMethod` (Online, ProformaInvoice)
- `Status` (Pending, Confirmed, Failed, Refunded)
- `TransactionId` (for online payments)
- `InvoiceNumber` (for proforma invoices)
- `PaidAt` (nullable)
- `CreatedAt`

**Relationships**:
- Belongs to one Event
- Belongs to one Applicant

---

### ProductSample
**Purpose**: Represents a product sample submitted for evaluation.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event)
- `ApplicantId` (foreign key to Applicant)
- `CategoryId` (foreign key to Category)
- `SequentialNumber` (unique within event)
- `Name` (product name)
- `Description` (optional)
- `QRCode` (unique identifier)
- `LabelData` (for printing)
- `EvaluationMode` (FinalScore, CriteriaBased)
- `Status` (Draft, Submitted, Evaluated, Excluded, Completed)
- `ExcludedAt` (nullable)
- `ExclusionReason` (nullable, required if excluded)
- `FinalScore` (nullable, calculated)
- `CreatedAt`
- `SubmittedAt` (nullable)
- `EvaluatedAt` (nullable)

**Relationships**:
- Belongs to one Event
- Belongs to one Applicant
- Belongs to one Category
- Has many EvaluationSessions
- Has many ExpertEvaluations (via EvaluationSession)
- Has one Record (after evaluation)

---

### Commission
**Purpose**: Represents an evaluation commission for a category.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event)
- `CategoryId` (foreign key to Category)
- `Name`
- `Description`
- `Status` (Active, Inactive)
- `CreatedAt`

**Relationships**:
- Belongs to one Event
- Belongs to one Category
- Has many CommissionMembers
- Has many EvaluationCriteria
- Evaluates many ProductSamples

---

### CommissionMember
**Purpose**: Represents a member of an evaluation commission with a specific role.

**Key Fields**:
- `Id` (unique identifier)
- `CommissionId` (foreign key to Commission)
- `UserId` (foreign key to User)
- `Role` (Chair, Member, Trainee)
- `IsExcluded` (boolean, can be excluded during evaluation)
- `ExcludedAt` (nullable)
- `ExclusionReason` (nullable)
- `JoinedAt`
- `CreatedAt`

**Relationships**:
- Belongs to one Commission
- Belongs to one User
- Creates many Evaluations
- Creates many Comments

---

### EvaluationCriterion
**Purpose**: Represents a criterion for criteria-based evaluation.

**Key Fields**:
- `Id` (unique identifier)
- `CommissionId` (foreign key to Commission, nullable - can be event-wide)
- `EventId` (foreign key to Event)
- `Name`
- `Description`
- `Weight` (optional, for weighted scoring)
- `DisplayOrder`
- `MinScore` (typically 1)
- `MaxScore` (typically 5 or 10)
- `IsRequired` (boolean)
- `CreatedAt`

**Relationships**:
- Belongs to one Event
- Optionally belongs to one Commission
- Used in many CriterionEvaluations

---

### EvaluationSession
**Purpose**: Represents an activation of a product sample for evaluation by a commission.

**Key Fields**:
- `Id` (unique identifier)
- `ProductSampleId` (foreign key to ProductSample)
- `CommissionId` (foreign key to Commission)
- `ActivatedBy` (foreign key to User - commission chair)
- `ActivatedAt`
- `Status` (Active, Completed, Cancelled)
- `CompletedAt` (nullable)
- `CreatedAt`

**Relationships**:
- Belongs to one ProductSample
- Belongs to one Commission
- Has many ExpertEvaluations
- Activated by one User (chair)

---

### ExpertEvaluation
**Purpose**: Represents a single expert evaluation of a product sample by a commission member.

**Key Fields**:
- `Id` (unique identifier)
- `EvaluationSessionId` (foreign key to EvaluationSession)
- `ProductSampleId` (foreign key to ProductSample)
- `CommissionMemberId` (foreign key to CommissionMember)
- `FinalScore` (nullable, for FinalScore mode)
- `IsSampleExcludedByEvaluator` (boolean)
- `ExclusionNote` (string, required if IsSampleExcludedByEvaluator is true)
- `SubmittedAt`
- `CreatedAt`
- `ModifiedAt` (for audit trail)
- `IsExcludedFromCalculation` (boolean, for trainee evaluations or if member was excluded)

**Relationships**:
- Belongs to one EvaluationSession
- Belongs to one ProductSample
- Belongs to one CommissionMember
- Has many CriterionEvaluations (if criteria-based)
- Has many Comments

---

### CriterionEvaluation
**Purpose**: Represents evaluation of a specific criterion within an expert evaluation.

**Key Fields**:
- `Id` (unique identifier)
- `ExpertEvaluationId` (foreign key to ExpertEvaluation)
- `EvaluationCriterionId` (foreign key to EvaluationCriterion)
- `Score`
- `CreatedAt`
- `ModifiedAt`

**Relationships**:
- Belongs to one ExpertEvaluation
- Belongs to one EvaluationCriterion

---

### Comment
**Purpose**: Represents a comment or note about an expert evaluation.

**Key Fields**:
- `Id` (unique identifier)
- `ExpertEvaluationId` (foreign key to ExpertEvaluation)
- `CommissionMemberId` (foreign key to CommissionMember, nullable - can be system-generated)
- `CommentType` (Structured, FreeText)
- `StructuredCommentId` (nullable, reference to predefined comment)
- `FreeText` (nullable)
- `Status` (Draft, Submitted, Approved, Rejected)
- `ApprovedBy` (nullable, User reference - typically commission chair)
- `ApprovedAt` (nullable)
- `CreatedAt`
- `ModifiedAt`
- `IsExcludedFromRecord` (boolean, if evaluation was excluded)

**Relationships**:
- Belongs to one ExpertEvaluation
- Optionally belongs to one CommissionMember
- Optionally references one StructuredCommentTemplate

---

### StructuredCommentTemplate
**Purpose**: Represents predefined typical errors or properties for structured comments.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event)
- `CategoryId` (foreign key to Category, nullable - can be event-wide)
- `Text`
- `CommentType` (Error, Property, Other)
- `DisplayOrder`
- `IsActive` (boolean)
- `CreatedAt`

**Relationships**:
- Belongs to one Event
- Optionally belongs to one Category
- Used in many Comments

---

### ScoringPolicy
**Purpose**: Represents event-defined scoring configuration.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event, unique)
- `TrimHighLowFromCount` (integer, default 5)
- `TrimCountHigh` (integer, default 1)
- `TrimCountLow` (integer, default 1)
- `RoundingDecimals` (integer, default 2)
- `CreatedAt`
- `ModifiedAt`

**Relationships**:
- Belongs to one Event (one-to-one)

---

### Record
**Purpose**: Represents an automatically generated evaluation record/protocol.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event)
- `ProductSampleId` (foreign key to ProductSample)
- `ApplicantId` (foreign key to Applicant)
- `RecordNumber` (sequential)
- `Version` (integer, starts at 1)
- `PreviousVersionId` (foreign key to Record, nullable)
- `FinalScore` (calculated)
- `Status` (Draft, Generated, Sent, Acknowledged)
- `GeneratedAt` (nullable)
- `SentAt` (nullable)
- `AcknowledgedAt` (nullable)
- `PDFPath` (nullable)
- `VersionCreatedAt`
- `VersionCreatedBy` (foreign key to User)
- `CreatedAt`

**Relationships**:
- Belongs to one Event
- Belongs to one ProductSample
- Belongs to one Applicant
- Has one previous version (nullable)
- Has many subsequent versions
- Created by one User
- Contains aggregated Comments

---

### ConsumerEvaluationStation
**Purpose**: Represents a station or point for consumer evaluation.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event)
- `Name`
- `Location`
- `IsActive` (boolean)
- `CreatedAt`

**Relationships**:
- Belongs to one Event
- Has many ConsumerEvaluations

---

### ConsumerEvaluation
**Purpose**: Represents a consumer's evaluation of a product sample.

**Key Fields**:
- `Id` (unique identifier)
- `EventId` (foreign key to Event)
- `ProductSampleId` (foreign key to ProductSample)
- `ConsumerEvaluationStationId` (foreign key to ConsumerEvaluationStation)
- `Score`
- `SubmittedAt`
- `CreatedAt`

**Relationships**:
- Belongs to one Event
- Belongs to one ProductSample
- Belongs to one ConsumerEvaluationStation

---

### AuditLog
**Purpose**: Represents an audit trail of system changes.

**Key Fields**:
- `Id` (unique identifier)
- `EntityType` (string, e.g., "ProductSample", "ExpertEvaluation")
- `EntityId` (foreign key reference)
- `Action` (Created, Updated, Deleted, StatusChanged)
- `UserId` (foreign key to User, nullable)
- `Changes` (JSON, before/after values)
- `Timestamp`
- `IPAddress` (nullable)
- `UserAgent` (nullable)

**Relationships**:
- Optionally references one User

---

### Notification
**Purpose**: Represents automated notifications sent to users.

**Key Fields**:
- `Id` (unique identifier)
- `UserId` (foreign key to User, nullable - can be email-only)
- `RecipientEmail`
- `RecipientPhone` (nullable)
- `NotificationType` (Email, SMS, Both)
- `Subject`
- `Body`
- `Status` (Pending, Sent, Failed, Delivered)
- `SentAt` (nullable)
- `CreatedAt`

**Relationships**:
- Optionally belongs to one User

---

## Relationships Summary

### One-to-Many
- Event → Applicants
- Event → ProductSamples
- Event → Commissions
- Event → Categories
- Event → EvaluationCriteria
- Event → Records
- Event → ConsumerEvaluationStations
- Event → ConsumerEvaluations
- Event → Payments
- Event → ScoringPolicy (one-to-one)
- Category → ProductSamples
- Category → Commissions
- Applicant → ProductSamples
- Applicant → Payments
- Applicant → Records
- Commission → CommissionMembers
- Commission → EvaluationCriteria
- Commission → EvaluationSessions
- CommissionMember → ExpertEvaluations
- CommissionMember → Comments
- ProductSample → EvaluationSessions
- ProductSample → ExpertEvaluations (via EvaluationSession)
- ProductSample → ConsumerEvaluations
- ProductSample → Record (one-to-one)
- EvaluationSession → ExpertEvaluations
- ExpertEvaluation → CriterionEvaluations
- ExpertEvaluation → Comments
- Record → Record (previous version)
- ConsumerEvaluationStation → ConsumerEvaluations

### Many-to-Many (via junction entities)
- CommissionMember ↔ ProductSample (via ExpertEvaluation)
- EvaluationCriterion ↔ ExpertEvaluation (via CriterionEvaluation)

---

## Invariants and Business Rules

### Event Rules
1. An event must have at least one category before samples can be submitted.
2. An event can be copied from another event, including categories, criteria, and commission structure.
3. An event must be in "Active" status for evaluations to occur.

### Applicant Rules
1. An applicant's email must be verified before submission is accepted.
2. An applicant's phone number must be verified via SMS before submission is accepted.
3. If payment is required for an event, an applicant's status remains "Draft" or "PaymentPending" until payment is confirmed.
4. Once payment is confirmed, applicant status changes to "PaymentConfirmed" and samples can be submitted.
5. An applicant can have multiple samples in the same event.

### Payment Rules
1. Payment is only required if the event has `PaymentRequired = true`.
2. Payment status must be "Confirmed" before applicant and samples can move from draft status.
3. Payment can be made online or via proforma invoice.
4. Only one active payment per applicant per event.
5. Payment must belong to the same event as the applicant.

### ProductSample Rules
1. Sequential number must be unique within an event.
2. QR code must be unique across all events.
3. Product sample status flow: Draft → Submitted → Evaluated/Excluded → Completed
4. A sample must belong to a category that has an active commission.
5. A sample can have multiple evaluation sessions (if re-evaluation is needed).
6. If more than half of the commission excludes a sample (via exclusion votes), it is automatically excluded.
7. Sample exclusion requires a mandatory reason.
8. Sample status cannot be changed after "Completed".

### Category Rules
1. Each category in an event can have at most one active commission.
2. Categories are event-specific and cannot be shared across events.

### Commission Rules
1. A commission must be associated with exactly one category.
2. A commission must have at least one member (chair).
3. A commission can have multiple members and trainees.
4. Only one chair per commission.
5. Commission members can be excluded during evaluation, but exclusion must be justified.

### EvaluationSession Rules
1. An evaluation session is created when a commission chair activates a product sample.
2. Only one active evaluation session can exist per product sample at a time.
3. An evaluation session must belong to a commission that matches the sample's category.
4. Commission members can submit expert evaluations only during an active session.
5. An evaluation session is completed when all members have submitted or the session is closed by the chair.
6. A sample can have multiple evaluation sessions (for re-evaluation scenarios).

### CommissionMember Rules
1. A user can be a member of multiple commissions in the same or different events.
2. A commission member's role determines their permissions:
   - Chair: can activate samples (create evaluation sessions), approve comments, confirm records
   - Member: can submit expert evaluations and comments
   - Trainee: can submit expert evaluations (may be excluded from final calculation)
3. If a commission member is excluded, their expert evaluations and comments are marked as excluded from calculation.
4. A commission member cannot submit multiple expert evaluations for the same evaluation session.

### ExpertEvaluation Rules
1. An expert evaluation can only be created during an active evaluation session.
2. An expert evaluation must belong to an active evaluation session.
3. For FinalScore mode: evaluation must have a FinalScore value.
4. For CriteriaBased mode: evaluation must have at least one CriterionEvaluation.
5. All required criteria must be evaluated in CriteriaBased mode.
6. Score values must be within the criterion's MinScore-MaxScore range.
7. Trainee evaluations can be marked as excluded from final calculation.
8. An expert evaluation cannot be modified after the evaluation session is completed.
9. Each commission member can submit at most one expert evaluation per evaluation session.
10. If `IsSampleExcludedByEvaluator` is true, `ExclusionNote` is required.
11. Exclusion votes from expert evaluations are used to determine automatic sample exclusion.

### ScoringPolicy Rules
1. Each event has exactly one scoring policy.
2. Scoring policy defines how scores are calculated and trimmed.
3. Default values: TrimHighLowFromCount=5, TrimCountHigh=1, TrimCountLow=1, RoundingDecimals=2.
4. Scoring policy can be modified per event to customize calculation rules.

### Score Calculation Rules
1. Score calculation uses the event's ScoringPolicy configuration.
2. **For evaluations count < TrimHighLowFromCount**: Calculate average of all non-excluded expert evaluations.
3. **For evaluations count >= TrimHighLowFromCount**:
   - Exclude TrimCountHigh highest scores
   - Exclude TrimCountLow lowest scores
   - Exclude comments associated with excluded expert evaluations
   - Calculate average of remaining expert evaluations
4. Excluded expert evaluations (trainee or member exclusion) are not included in calculation.
5. Final score is rounded to the number of decimals specified in ScoringPolicy.RoundingDecimals.
6. Score calculation is based on expert evaluations from the most recent completed evaluation session.

### Comment Rules
1. Comments are linked to expert evaluations, not directly to product samples.
2. Comments can be structured (from template) or free text.
3. Comments must be approved by commission chair before inclusion in record.
4. Comments associated with excluded expert evaluations are automatically excluded from record.
5. Multiple comments can be submitted per expert evaluation.
6. Comments can be rejected by chair with optional reason.

### Record Rules
1. A record is automatically generated after a sample is evaluated (not excluded).
2. One record per food sample per version.
3. Record includes aggregated approved comments from expert evaluations.
4. Record status flow: Draft → Generated → Sent → Acknowledged
5. Records are automatically sent to applicants via email.
6. Records can be exported to PDF and Excel.
7. Record versioning: When a record is regenerated (e.g., after re-evaluation), a new version is created with incremented version number.
8. Previous version is linked via PreviousVersionId to maintain history.
9. Version tracking includes who created the version and when.
10. Only the latest version is considered active for sending to applicants.

### Consumer Evaluation Rules
1. Consumer evaluations are completely separate from expert commission evaluations.
2. Consumer evaluations do not generate records.
3. Multiple consumer evaluation stations can operate simultaneously.
4. Each consumer can submit one evaluation per product sample.
5. Consumer evaluations are simple score-based (no criteria).

### Audit Trail Rules
1. All entity modifications must be logged in AuditLog.
2. Audit log entries are immutable (cannot be deleted or modified).
3. Audit log must capture: who, what, when, before/after values.

### Notification Rules
1. Applicants are automatically notified when:
   - Payment is required
   - Payment is confirmed
   - Record is generated and sent
2. Commission members are notified when:
   - Evaluation session is created (sample is activated for evaluation)
   - Record requires approval
3. Notifications can be sent via email, SMS, or both.
4. Notification delivery status must be tracked.

### Sequential Numbering Rules
1. Product sample sequential numbers are unique within an event.
2. Sequential numbers are assigned automatically and cannot be manually set.
3. Sequential numbers must be unique within an event.
4. Sequential numbers are assigned when sample status changes from Draft to Submitted.

### QR Code Rules
1. QR code is generated automatically when sample is created.
2. QR code must be globally unique (across all events).
3. QR code is used for sample identification and activation.

### Exclusion Rules
1. Sample exclusion can be initiated by any commission member via their expert evaluation.
2. Sample exclusion requires mandatory reason (ExclusionNote) when IsSampleExcludedByEvaluator is true.
3. If more than 50% of active commission members vote to exclude a sample (via IsSampleExcludedByEvaluator), it is automatically excluded.
4. Excluded samples do not generate records.
5. Excluded samples are included in analytics as "excluded".

### Multi-language Rules
1. All user-facing text must support multiple languages.
2. Language preference is stored per user.
3. Event-specific content (categories, criteria, comment templates) can be translated per event.

### Offline Support Rules
1. All entities must support offline creation and modification.
2. Entities created offline use UUIDs as identifiers.
3. Offline operations are queued for synchronization when connection is restored.
4. Synchronization must resolve conflicts (last-write-wins or conflict resolution).
5. Queued operations maintain operation order and entity relationships via UUIDs.

---

## Domain Abstraction Principles

1. **No Food Type Assumptions**: The system must never assume specific food types (meat, dairy, wine, etc.).
2. **Event-Defined Configuration**: Categories, criteria, and evaluation logic are defined per event, not hardcoded.
3. **Configurable Behavior**: Domain-specific behavior (e.g., scoring rules, exclusion thresholds) must be configurable per event.
4. **Extensibility**: The model must support future domains (meat, dairy, wine, honey, bakery, processed foods) without code changes.

---

## Status Enumerations

### EventStatus
- Draft
- Active
- Completed
- Archived

### ApplicantStatus
- Draft
- Submitted
- PaymentPending
- PaymentConfirmed
- Rejected

### PaymentStatus
- Pending
- Confirmed
- Failed
- Refunded

### ProductSampleStatus
- Draft
- Submitted
- Evaluated
- Excluded
- Completed

### CommissionStatus
- Active
- Inactive

### CommissionMemberRole
- Chair
- Member
- Trainee

### EvaluationMode
- FinalScore
- CriteriaBased

### EvaluationSessionStatus
- Active
- Completed
- Cancelled

### CommentType
- Structured
- FreeText

### CommentStatus
- Draft
- Submitted
- Approved
- Rejected

### RecordStatus
- Draft
- Generated
- Sent
- Acknowledged

### NotificationStatus
- Pending
- Sent
- Failed
- Delivered

### UserRole
- Administrator
- Organizer
- CommissionChair
- CommissionMember
- CommissionTrainee
- Applicant
- Consumer

---

## Revised Entity List Summary

### Core Entities (20 total)

1. **User** - System users with authentication and roles
2. **Event** - Product evaluation session
3. **Category** - Product category within an event
4. **Applicant** - Participant who submits samples
5. **Payment** - Payment for event participation
6. **ProductSample** - Product sample submitted for evaluation
7. **Commission** - Evaluation commission for a category
8. **CommissionMember** - Member of a commission with role
9. **EvaluationSession** - Activation of sample for evaluation
10. **ExpertEvaluation** - Expert evaluation by commission member
11. **EvaluationCriterion** - Criterion for criteria-based evaluation
12. **CriterionEvaluation** - Evaluation of a specific criterion
13. **Comment** - Comment linked to expert evaluation
14. **StructuredCommentTemplate** - Predefined comment templates
15. **ScoringPolicy** - Event-defined scoring configuration
16. **Record** - Generated evaluation record with versioning
17. **ConsumerEvaluationStation** - Station for consumer evaluation
18. **ConsumerEvaluation** - Consumer's evaluation (separate from expert)
19. **AuditLog** - Audit trail of system changes
20. **Notification** - Automated notifications

### Key Changes Made

1. **Removed consumer logic from Evaluation**: 
   - Renamed `Evaluation` to `ExpertEvaluation`
   - Removed `EvaluationType` field (only expert evaluations)
   - Consumer evaluations remain completely separate via `ConsumerEvaluation` entity

2. **Added EvaluationSession**:
   - Represents activation of a product sample for evaluation
   - Links ProductSample to Commission
   - Tracks who activated (chair) and when
   - Manages active evaluation sessions

3. **Updated Comment relationship**:
   - Comments now link to `ExpertEvaluation` instead of `ProductSample`
   - Comments are evaluation-specific, not sample-specific

4. **Added Record versioning**:
   - Added `Version` field (integer, starts at 1)
   - Added `PreviousVersionId` for version history
   - Added `VersionCreatedAt` and `VersionCreatedBy` for audit

5. **Adjusted sequential numbering**:
   - Removed `Year` field from Event
   - Sequential numbers are unique within Event (not per year)
   - Updated all related rules

---

## Key Invariants Summary

### Evaluation Flow Invariants
1. Product sample must be in "Submitted" status before evaluation session can be created
2. Only commission chair can create evaluation session (activate sample)
3. Evaluation session must belong to commission matching sample's category
4. Only one active evaluation session per product sample at a time
5. Expert evaluations can only be created during active evaluation session
6. Each commission member can submit at most one expert evaluation per session
7. Expert evaluation exclusion vote requires mandatory exclusion note

### Separation Invariants
1. Expert evaluations and consumer evaluations are completely separate
2. Consumer evaluations never generate records
3. Expert evaluations are always linked to an evaluation session
4. Comments are always linked to expert evaluations, never directly to samples

### Sequential Numbering Invariants
1. Sequential numbers are unique within an event (not per year)
2. Sequential numbers are auto-assigned and immutable
3. Sequential numbers assigned when sample moves from Draft to Submitted

### Record Versioning Invariants
1. First record version always has Version = 1
2. Each new version increments version number
3. PreviousVersionId links to immediate predecessor
4. Only latest version is considered active for sending
5. Version history is immutable (cannot delete or modify past versions)

### Score Calculation Invariants
1. Calculation uses event's ScoringPolicy configuration
2. Calculation based on expert evaluations from most recent completed session
3. If count < TrimHighLowFromCount: average of all non-excluded
4. If count >= TrimHighLowFromCount: exclude TrimCountHigh highest and TrimCountLow lowest, then average
5. Excluded evaluations (trainee/member exclusion) never included
6. Comments from excluded evaluations automatically excluded from record
7. Final score rounded to ScoringPolicy.RoundingDecimals decimal places

### Status Flow Invariants
1. ProductSample: Draft → Submitted → Evaluated/Excluded → Completed
2. EvaluationSession: Active → Completed/Cancelled
3. ExpertEvaluation: Created → Submitted (immutable after session completion)
4. Comment: Draft → Submitted → Approved/Rejected
5. Record: Draft → Generated → Sent → Acknowledged

### Exclusion Invariants
1. Sample exclusion vote (IsSampleExcludedByEvaluator) requires mandatory ExclusionNote
2. If >50% of active commission members vote to exclude → automatic sample exclusion
3. Excluded samples never generate records
4. Member exclusion marks their evaluations/comments as excluded from calculation
5. Exclusion votes are tracked per expert evaluation
