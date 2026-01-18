# Search Specifications

The application supports a powerful, Google-like search experience for finding utilities on campus. The search functionality is integrated into the utility list and supports various query types.

## Search Capabilities

### 1. Global vs. Category Search
- **Global Search:** If no utility categories are selected, the search bar performs a global search across ALL categories.
- **Category Filter:** If categories are selected (e.g., "Water" and "Microwave"), the search results are restricted to only those categories.

### 2. Searchable Fields
The search engine indexes the following fields for every utility:
- **Name:** The primary title of the utility (e.g., "Water Fountain").
- **Building:** The building name where the utility is located (e.g., "Chemistry Block B").
- **Floor/Description:** Floor numbers or identifying descriptions (e.g., "Basement", "2nd Floor").
- **Type:** The utility category itself (e.g., searching "microwave" matches items of type Microwave).

### 3. Ranking Algorithm
We employ a weighted scoring system to prioritize the most relevant results.

#### Single-Term Queries
For single-word queries (e.g., "Chemistry"), results are ranked by comparing the query against each field individually.
- **Exact Match:** Score 100
- **Prefix Match:** Score 80 (Starts with query)
- **Token Match:** Score 60 (Word within text starts with query)
- **Substring Match:** Score 40 (Contains query)

**Field Weights:**
To ensure intuitive results, matches in certain fields are more valuable than others:
1. **Name:** Weight 1.0 (Highest priority)
2. **Building:** Weight 0.9 (Slight penalty)
3. **Type:** Weight 0.8 (Medium penalty)
4. **Floor:** Weight 0.7 (Lowest priority)

*Example:* Searching "Chemistry" will rank a utility named "Chemistry Lab" (Name match) higher than a fountain located in "Chemistry Block B" (Building match).

#### Multi-Term Queries
For queries with multiple terms (e.g., "broken chemistry"), the system uses a **Composite Match** logic.
- The system concatenates all searchable fields into a single text block.
- **Requirement:** ALL terms in the query must be present in this composite text (order independent).
- **Scoring:** Successful multi-term matches are assigned a fixed high relevance score (80) to ensure they appear prominently, but slightly below exact single-field name matches.

### 4. Search Behavior Notes
- **Case Insensitive:** All searches ignore capitalization.
- **Order Independent:** Terms in multi-term queries can be in any order ("chemistry broken" = "broken chemistry").
- **Edge Cases:** Empty or whitespace-only queries return no results (or all selected category items if no text).
