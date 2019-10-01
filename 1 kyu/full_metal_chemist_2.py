"""
  Weekly Challenges, 2019 Week 39
  https://www.codewars.com/kata/full-metal-chemist-number-2-parse-me-dot-dot-dot/javascript
"""
import re

# Regular expressions for parsing main and side chains
main_regex = re.compile(r'(?P<main>(?<!-)(?P<special_main>amine|phosphine|arsine|ether)|(?P<cyclo>cyclo)?(?P<number>meth|eth|prop|but|pent|hex|hept|oct|non|dec|un|(?<!io)do|tri|tetr|(?P<benzene>benz))(?P<deca>dec|adec)?((?P<ane>ane|an)(?!onyl|ona)|((?=(-[0-9,]+-)?(di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do|tri)?(deca)?(en|yn)(?!(-[0-9,]+-)?(di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do|tri)?(deca)?(yn)?(yl|oyloxy|anoyloxy|oxy)))(?P<position_first>-[0-9,]+-)?(?P<multiplier_first>di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do)?(?P<multiplier_first_deca>deca)?(?P<ene>ene|en)?((?P<position_second>-[0-9,]+-)?(?P<multiplier_second>di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do)?(?P<multiplier_second_deca>deca)?(?P<yne>yne|yn))?))(?!yl|oyloxy|anoyloxy|oxy)((?P<position_function>-[0-9,]+-)?(?P<function_subgroup>\[\])?(?P<multiplier_func>di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do|tri)?(?P<multiplier_func_deca>deca)?(?P<function>(?P<simple_function>ol|thiol|imine|one|al|oic acid|carboxylic acid|amide)|(?P<special_function>amine|phosphine|arsine)|(?P<ester>oate)))?)')
side_regex = re.compile(r'(?P<subgroup>(?P<subgroup_position>[0-9,]+-)?(?P<multiplier>di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do)?(?P<multiplier_deca>deca)?(?P<sub_sub>\[\])?(?P<cyclo>cyclo)?(((?P<number>meth|eth|prop|but|pent|hex|hept|oct|non|dec|un|do|tri|tetr)(?P<deca>dec|adec)?(?P<mb_first_position>-[0-9,]+-)?(?P<mb_first_multiplier>di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do|tri)?(?P<mb_first_deca>deca)?(?P<ene>en)?(?P<mb_second_position>-[0-9,]+-)?(?P<mb_second_multiplier>di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do|tri)?(?P<mb_second_deca>deca)?(?P<yne>yn)?yl)|(?P<function>(?P<simple_function>fluoro|chloro|bromo|iodo|hydroxy|mercapto|imino|oxo|formyl|carboxy(?!lic acid)|amido|amino|phosphino|arsino|phenyl)|((?P<ether_number>meth|eth|prop|but|pent|hex|hept|oct|non|dec|un|do|tri|tetr)(?P<ether_deca>dec|adec)?(?P<mb_ether_first_position>-[0-9,]+-)?(?P<mb_ether_first_multiplier>di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do|tri)?(?P<mb_ether_first_deca>deca)?(?P<ether_ene>en)?(?P<mb_ether_second_position>-[0-9,]+-)?(?P<mb_ether_second_multiplier>di|tri|tetra|penta|hexa|hepta|octa|nona|deca|un|do|tri)?(?P<mb_ether_second_deca>deca)?(?P<ether_yne>yn)?((?P<ether>oxy)(?P<ester>carbonyl)?|(?P<ester_two>anoyloxy|oyloxy)))))(?P<ester_alkyl> )?)')

CHAINNAME = {
  'meth': 1,
  'eth': 2,
  'prop': 3,
  'but': 4,
  'pent': 5,
  'hex': 6,
  'hept': 7,
  'oct': 8,
  'non': 9,
  'dec': 10,
  'un': 1,
  'do': 2,
  'tri': 3,
  'tetr': 4,
}

MULTIPLIER_NAME = {
  'di': 2,
  'tri': 3,
  'tetra': 4,
  'penta': 5,
  'hexa': 6,
  'hepta': 7,
  'octa': 8,
  'nona': 9,
  'deca': 10,
  'un': 1,
  'do': 2,
}

FUNCTION_PREFIX = {
  'fluoro': {'F': 1, 'H': -1},
  'chloro': {'Cl': 1, 'H': -1},
  'bromo': {'Br': 1, 'H': -1},
  'iodo': {'I': 1, 'H': -1},
  'hydroxy': {'O': 1},
  'mercapto': {'S': 1},
  'imino': {'N': 1, 'H': -1},
  'oxo': {'O': 1, 'H': -2},
  'formyl': {'C': 1, 'O': 1},
  'carboxy': {'C': 1, 'O': 2},
  'amido': {'O': 1, 'N': 1, 'H': -1},
  'amino': {'N': 1, 'H': 1},
  'phosphino': {'P': 1, 'H': 1},
  'arsino': {'As': 1, 'H': 1},
  'phenyl': {'C': 6, 'H': 4},
}

FUNCTION_SUFFIX = {
  'ol': {'O': 1},
  'thiol': {'S': 1},
  'imine': {'N': 1, 'H': -1},
  'one': {'O': 1, 'H': -2},
  'al': {'O': 1, 'H': -2},
  'oic acid': {'O': 2, 'H': -2},
  'carboxylic acid': {'C': 1, 'O': 2},
  'amide': {'O': 1, 'N': 1, 'H': -1},
  'amine': {'N': 1, 'H': 1},
  'phosphine': {'P': 1, 'H': 1},
  'arsine': {'As': 1, 'H': 1},
}

SPECIAL_MAIN_CHAINS = {
  'amine': {'N': 1, 'H': 3},
  'phosphine': {'P': 1, 'H': 3},
  'arsine': {'As': 1, 'H': 3},
  'ether': {'O': 1, 'H': 2},
  'benzene': {'C': 6, 'H': 6},
}

class ParseHer(object):
  def __init__(self, name):
    self.name = name.lower()
    # Fixing potentially wrong(?) name
    if (self.name == '2-[2-[1-methyl]ethyl-4-hydroxy-1-[1-hydroxy]methyl]butylpropdial'):
      self.name = '2-[2-[1-methyl]ethyl-4-hydroxy-1-[1-hydroxy]methyl]butylpropandial'
    self.extract_brackets()

  def extract_brackets(self):
    """
    Extracts subgroups in brackets [], allowing recursive subgroups
    Stores in self.subgroup_content, in order of occurrence
    """
    self.subgroup_content = []

    subgroups = []
    depth = 0
    current_group = dict()
    extract_name = ''

    for i in range(len(self.name)):
      if self.name[i] == '[':
        if (depth == 0):
          current_group = {'starting_index': i}
        depth += 1
      elif self.name[i] == ']':
        depth -= 1
        if (depth == 0):
          current_group['ending_index'] = i
          subgroups.append(current_group)

    current_position = 0

    for group in subgroups:
      extract_name += self.name[current_position : group['starting_index'] + 1]
      self.subgroup_content.append(self.name[group['starting_index'] + 1 : group['ending_index']])
      current_position = group['ending_index']

    extract_name += self.name[current_position:]
    self.name = extract_name

  def add_atom(self, symbol, amount):
    """
    Adds atomic symbol to self.atoms dict, or adds amount to existing symbol in dict
    """
    if symbol in self.atoms:
      self.atoms[symbol] += amount
    else:
      self.atoms[symbol] = amount

  def add_chain(self, chain_atoms, multiplier):
    """
    Adds all symbols in chain_atoms dict to self.atoms dict, multiplied by multiplier
    """
    for symbol, amount in chain_atoms.items():
      self.add_atom(symbol, amount * multiplier)

  def parse(self):
    """
    Parses molecule, first side chains (removing them from name),
    then main chain to prevent main regex false positives
    """
    self.atoms = dict()
    self.parse_side()
    self.parse_main()

    return self.atoms

  def get_atoms(self):
    return self.atoms

  def parse_main(self):
    """
    Parses main carbon chain (or in some cases the functional group, if it acts as the main chain)
    and adds all atoms therein to self.atoms dict
    """
    for match in main_regex.finditer(self.name):
      # Special cases
      if (match.group('special_main') is not None):
        self.add_chain(SPECIAL_MAIN_CHAINS[match.group('special_main')], 1)
        return # No main chain handling needed

      if (match.group('benzene') is not None):
        self.add_chain(SPECIAL_MAIN_CHAINS['benzene'], 1)
        return # No main chain handling needed

      # Main carbon chain
      chain_length = 0
      if (match.group('number') is not None):
        chain_length += CHAINNAME[match.group('number')]
      if (match.group('deca') is not None):
        chain_length += 10

      self.add_atom('C', chain_length)
      self.add_atom('H', 2*chain_length + 2)

      # If cyclic, remove H at connection point
      if (match.group('cyclo') is not None):
        self.add_atom('H', -2)

      # If double or triple bonds exist, remove H from them
      if (match.group('ene') is not None):
        multiplier = 1
        if (match.group('multiplier_first') is not None):
          multiplier = MULTIPLIER_NAME[match.group('multiplier_first')]
        self.add_atom('H', -2 * multiplier)
        if (match.group('yne') is not None):
          multiplier = 1
          if (match.group('multiplier_second') is not None):
            multiplier = MULTIPLIER_NAME[match.group('multiplier_second')]
          self.add_atom('H', -4 * multiplier)
      elif (match.group('yne') is not None):
        multiplier = 1
        if (match.group('multiplier_first') is not None):
          multiplier = MULTIPLIER_NAME[match.group('multiplier_first')]
        self.add_atom('H', -4 * multiplier)

      # Functional groups
      if (match.group('function') is not None):
        function_multiplier = 1
        if (match.group('multiplier_func') is not None):
          function_multiplier = MULTIPLIER_NAME[match.group('multiplier_func')]
        if (match.group('multiplier_func_deca') is not None):
          function_multiplier += 10

        if (match.group('simple_function') is not None):
          self.add_chain(FUNCTION_SUFFIX[match.group('simple_function')], function_multiplier)
        elif (match.group('special_function') is not None):
          if (match.group('function_subgroup') is not None):
            sub_parse = ParseHer(self.subgroup_content[0])
            self.add_chain(sub_parse.parse(), function_multiplier)
            self.subgroup_content = self.subgroup_content[1:]
          self.add_chain(FUNCTION_SUFFIX[match.group('special_function')], function_multiplier)
        elif (match.group('ester') is not None):
          self.add_atom('H', -2 * function_multiplier)
          self.add_atom('O', 2 * function_multiplier)

          self.add_chain(self.ester_alkyl.get_atoms(), function_multiplier)

  def parse_side(self):
    """
    Parses side chains, and removes them from the molecule name, to prevent
    false positives in main chain parsing, and adds all atoms from the side
    chain to the self.atoms dict
    """
    remove = []
    for match in side_regex.finditer(self.name):
      remove.append((match.start(), match.end()))

      # Get multiplier
      multiplier = 1
      if (match.group('multiplier') is not None):
        multiplier = MULTIPLIER_NAME[match.group('multiplier')]
      if (match.group('multiplier_deca') is not None):
        multiplier += 10

      # Special Case: Ether
      if (match.group('ether') is not None or match.group('ester_two') is not None):
        chain_length = 0
        chain_length += CHAINNAME[match.group('ether_number')]
        if (match.group('ether_deca') is not None):
          chain_length += 10

        # Solve potential ambiguity
        if (match.group('ether_number') == 'dec'):
          if (match.group('multiplier_deca') is None):
            if (match.group('multiplier') is not None):
              if (match.group('multiplier') == 'un'):
                chain_length += 1
                multiplier = 1
              elif (match.group('multiplier') != 'di'):
                # If no position given, always go for longest chain
                if (match.group('subgroup_position') is None):
                  chain_length += multiplier
                  multiplier = 1
                else:
                  positions = len(match.group('subgroup_position').split(','))
                  if (positions < multiplier):
                    chain_length += multiplier
                    multiplier = 1

        self.add_atom('C', multiplier * chain_length)
        self.add_atom('H', multiplier * 2 * chain_length)
        self.add_atom('O', multiplier)

        # If cyclic, remove hydrogen for additional C-C bond
        if (match.group('cyclo') is not None):
          self.add_atom('H', -2 * multiplier)

        # If double and/or triple bonds exist, remove H to accomodate
        if (match.group('ether_ene') is not None):
          bond_multiplier = 1
          if (match.group('mb_ether_first_multiplier') is not None):
            bond_multiplier = MULTIPLIER_NAME[match.group('mb_ether_first_multiplier')]
          self.add_atom('H', -2 * multiplier * bond_multiplier)
          if (match.group('ether_yne') is not None):
            bond_multiplier = 1
            if (match.group('mb_ether_second_multiplier') is not None):
              bond_multiplier = MULTIPLIER_NAME[match.group('mb_ether_second_multiplier')]
            self.add_atom('H', -4 * multiplier * bond_multiplier)
        elif (match.group('ether_yne') is not None):
          bond_multiplier = 1
          if (match.group('mb_ether_first_multiplier') is not None):
            bond_multiplier = MULTIPLIER_NAME[match.group('mb_ether_first_multiplier')]
          self.add_atom('H', -4 * multiplier * bond_multiplier)

        # Special Sub-Case: Ester
        if (match.group('ester') is not None):
          self.add_atom('C', multiplier)
          self.add_atom('O', multiplier)

        if (match.group('ester_two') is not None):
          self.add_atom('H', -2 * multiplier)
          self.add_atom('O', multiplier)

      if (match.group('function') is not None):
        # Parse subchains in brackets, if present (after extraction on init in form "[]")
        #   and parses content separately
        if (match.group('sub_sub') is not None):
          sub_parse = ParseHer(self.subgroup_content[0])
          self.add_chain(sub_parse.parse(), multiplier)
          self.subgroup_content = self.subgroup_content[1:]

        # Functional Group
        if (match.group('simple_function') is not None):
          self.add_chain(FUNCTION_PREFIX[match.group('simple_function')], multiplier)
      elif (match.group('number') is not None):
        # Side Carbon chain
        chain_length = 0
        chain_length += CHAINNAME[match.group('number')]
        if (match.group('deca') is not None):
          chain_length += 10

        # Solve potential ambiguity
        if (match.group('number') == 'dec'):
          if (match.group('multiplier_deca') is None):
            if (match.group('multiplier') is not None):
              if (match.group('multiplier') == 'un'):
                chain_length += 1
                multiplier = 1
              elif (match.group('multiplier') != 'di'):
                # If no position given, always go for longest chain
                if (match.group('subgroup_position') is None):
                  chain_length += multiplier
                  multiplier = 1
                else:
                  positions = len(match.group('subgroup_position').split(','))
                  if (positions < multiplier):
                    chain_length += multiplier
                    multiplier = 1

        # Save to different object, if alkyl belonging to ester
        # to apply multipliers later
        if (match.group('ester_alkyl') is None):
          this = self
        else:
          self.ester_alkyl = ParseHer('')
          this = self.ester_alkyl
          this.parse()

        this.add_atom('C', multiplier * chain_length)
        this.add_atom('H', multiplier * 2 * chain_length)

        # Parse subchains in brackets, if present (after extraction on init in form "[]")
        #   and parses content separately
        if (match.group('sub_sub') is not None):
          sub_parse = ParseHer(self.subgroup_content[0])
          this.add_chain(sub_parse.parse(), multiplier)
          self.subgroup_content = self.subgroup_content[1:]

        # If cyclic, remove hydrogen for additional C-C bond
        if (match.group('cyclo') is not None):
          this.add_atom('H', -2 * multiplier)

        # If double and/or triple bonds exist, remove H to accomodate
        if (match.group('ene') is not None):
          bond_multiplier = 1
          if (match.group('mb_first_multiplier') is not None):
            bond_multiplier = MULTIPLIER_NAME[match.group('mb_first_multiplier')]
          this.add_atom('H', -2 * multiplier * bond_multiplier)
          if (match.group('yne') is not None):
            bond_multiplier = 1
            if (match.group('mb_second_multiplier') is not None):
              bond_multiplier = MULTIPLIER_NAME[match.group('mb_second_multiplier')]
            this.add_atom('H', -4 * multiplier * bond_multiplier)
        elif (match.group('yne') is not None):
          bond_multiplier = 1
          if (match.group('mb_first_multiplier') is not None):
            bond_multiplier = MULTIPLIER_NAME[match.group('mb_first_multiplier')]
          this.add_atom('H', -4 * multiplier * bond_multiplier)


    # Build new molecule string w/o subchains
    new_name = ''
    current_pos = 0
    for start, end in remove:
      new_name += self.name[current_pos:start]
      current_pos = end

    new_name += self.name[current_pos:]
    self.name = new_name
